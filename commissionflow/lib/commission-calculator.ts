// @ts-nocheck
import { createServerClient } from './supabase/client'
import type {
  MonthlyCommissionResult,
  TelesalesCommissionSummary,
  MonthlyCommissionSummary,
  Deal,
  User,
} from '@/types'

export class CommissionCalculator {
  /**
   * Calculate BDM commission for a specific month using DEFICIT MODEL
   *
   * Logic (CORRECT WAY):
   * 1. Get all deals paid in this month for this BDM
   * 2. Sum the remaining profit (after telesales commission)
   * 3. Get organization settings (base threshold + commission rate)
   * 4. Get deficit from previous month (if any)
   * 5. Calculate threshold needed = base threshold + previous deficit
   * 6. Check if monthly profit >= threshold needed
   * 7. If YES:
   *    - Calculate excess = monthly profit - threshold needed
   *    - Commission = excess × commission rate
   *    - Deficit to next month = 0 (cleared!)
   * 8. If NO:
   *    - Commission = 0
   *    - Deficit to next month = threshold needed - monthly profit
   */
  async calculateMonthlyBDMCommission(
    organizationId: string,
    bdmId: string,
    month: number,
    year: number
  ): Promise<MonthlyCommissionResult> {
    const supabase = createServerClient()

    // Step 1: Get organization settings
    const { data: org } = await supabase
      .from('organizations')
      .select('bdm_threshold_amount, bdm_commission_rate')
      .eq('id', organizationId)
      .single()

    const baseThreshold = org?.bdm_threshold_amount || 350000 // £3,500 default
    const commissionRate = org?.bdm_commission_rate || 1.0 // 100% default

    // Step 2: Get all deals paid in this month for this BDM
    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)

    const { data: dealsThisMonth, error } = await supabase
      .from('deals')
      .select('id, remaining_profit')
      .eq('organization_id', organizationId)
      .eq('bdm_id', bdmId)
      .eq('status', 'paid')
      .gte('month_paid', monthStart.toISOString())
      .lte('month_paid', monthEnd.toISOString())

    if (error) {
      console.error('Error fetching deals:', error)
      throw new Error('Failed to fetch deals for commission calculation')
    }

    // Step 3: Sum the remaining profit
    const monthlyProfit = dealsThisMonth.reduce(
      (sum, deal) => sum + (deal.remaining_profit || 0),
      0
    )

    // Step 4: Get deficit from previous month
    const previousMonth = month === 1 ? 12 : month - 1
    const previousYear = month === 1 ? year - 1 : year

    const { data: previousRecord } = await supabase
      .from('commission_records')
      .select('deficit_to_next')
      .eq('organization_id', organizationId)
      .eq('bdm_id', bdmId)
      .eq('year', previousYear)
      .eq('month', previousMonth)
      .single()

    const previousDeficit = previousRecord?.deficit_to_next || 0

    // Step 5: Calculate threshold needed this month
    const thresholdNeeded = baseThreshold + previousDeficit

    // Step 6: Check if threshold is met
    const thresholdMet = monthlyProfit >= thresholdNeeded

    let bdmCommission = 0
    let excessOverThreshold = 0
    let deficitToNext = 0

    if (thresholdMet) {
      // YES! They exceeded the threshold
      excessOverThreshold = monthlyProfit - thresholdNeeded
      bdmCommission = Math.round(excessOverThreshold * commissionRate)
      deficitToNext = 0 // Debt cleared
    } else {
      // NO! Still short
      bdmCommission = 0
      excessOverThreshold = 0
      deficitToNext = thresholdNeeded - monthlyProfit // Debt increases
    }

    return {
      month,
      year,
      bdmId,
      monthlyProfit,
      previousCarryover: previousDeficit, // Keep for backwards compatibility
      cumulativeAmount: thresholdNeeded, // Actually the threshold needed
      thresholdAmount: baseThreshold,
      thresholdMet,
      bdmCommission,
      carryoverToNext: deficitToNext, // Keep for backwards compatibility
      dealsCount: dealsThisMonth.length,
    }
  }

  /**
   * Save commission record to database (using new deficit model)
   */
  async saveCommissionRecord(
    organizationId: string,
    result: MonthlyCommissionResult,
    calculatedBy: string
  ) {
    const supabase = createServerClient()

    // Calculate excess (if threshold met)
    const excessOverThreshold = result.thresholdMet
      ? result.monthlyProfit - result.cumulativeAmount
      : 0

    const { data, error } = await supabase
      .from('commission_records')
      .upsert(
        {
          organization_id: organizationId,
          bdm_id: result.bdmId,
          month: result.month,
          year: result.year,
          monthly_profit: result.monthlyProfit,
          previous_deficit: result.previousCarryover, // Using old field name for new meaning
          threshold_needed: result.cumulativeAmount, // This is threshold needed (base + deficit)
          base_threshold: result.thresholdAmount,
          threshold_met: result.thresholdMet,
          excess_over_threshold: excessOverThreshold,
          bdm_commission: result.bdmCommission,
          deficit_to_next: result.carryoverToNext, // Using old field name for new meaning
          deals_count: result.dealsCount,
          calculated_by: calculatedBy,
        },
        {
          onConflict: 'organization_id,bdm_id,year,month',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving commission record:', error)
      throw new Error('Failed to save commission record')
    }

    return data
  }

  /**
   * Calculate telesales commissions for a month
   */
  async calculateTelesalesCommissions(
    organizationId: string,
    month: number,
    year: number
  ): Promise<TelesalesCommissionSummary[]> {
    const supabase = createServerClient()

    const monthStart = new Date(year, month - 1, 1)
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999)

    const { data: deals, error } = await supabase
      .from('deals')
      .select(
        `
        id,
        initial_profit,
        telesales_commission,
        telesales_agent_id,
        telesales_agent:users!deals_telesales_agent_id_fkey(id, name)
      `
      )
      .eq('organization_id', organizationId)
      .eq('status', 'paid')
      .gte('month_paid', monthStart.toISOString())
      .lte('month_paid', monthEnd.toISOString())

    if (error) {
      console.error('Error fetching telesales deals:', error)
      throw new Error('Failed to fetch telesales deals')
    }

    // Group by telesales agent
    const commissionsByAgent: Record<string, TelesalesCommissionSummary> = {}

    deals.forEach((deal: any) => {
      const agentId = deal.telesales_agent_id
      const agentName = deal.telesales_agent?.name || 'Unknown'

      if (!commissionsByAgent[agentId]) {
        commissionsByAgent[agentId] = {
          agentId,
          agentName,
          dealsCount: 0,
          totalProfit: 0,
          totalCommission: 0,
        }
      }

      commissionsByAgent[agentId].dealsCount++
      commissionsByAgent[agentId].totalProfit += deal.initial_profit || 0
      commissionsByAgent[agentId].totalCommission += deal.telesales_commission || 0
    })

    return Object.values(commissionsByAgent)
  }

  /**
   * Get complete commission summary for entire organization for a month
   */
  async getMonthlyCommissionSummary(
    organizationId: string,
    month: number,
    year: number
  ): Promise<MonthlyCommissionSummary> {
    const supabase = createServerClient()

    // Get telesales commissions
    const telesalesCommissions = await this.calculateTelesalesCommissions(
      organizationId,
      month,
      year
    )

    // Get all BDMs in the organization
    const { data: bdms, error } = await supabase
      .from('users')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('role', 'bdm')
      .eq('active', true)

    if (error) {
      console.error('Error fetching BDMs:', error)
      throw new Error('Failed to fetch BDMs')
    }

    // Calculate BDM commissions
    const bdmCommissions = await Promise.all(
      bdms.map((bdm) =>
        this.calculateMonthlyBDMCommission(organizationId, bdm.id, month, year)
      )
    )

    // Calculate totals
    const totalTelesalesCommission = telesalesCommissions.reduce(
      (sum, agent) => sum + agent.totalCommission,
      0
    )

    const totalBDMCommission = bdmCommissions.reduce(
      (sum, bdm) => sum + bdm.bdmCommission,
      0
    )

    return {
      month,
      year,
      telesales: telesalesCommissions,
      bdms: bdmCommissions,
      totalTelesalesCommission,
      totalBDMCommission,
      totalCommissions: totalTelesalesCommission + totalBDMCommission,
    }
  }

  /**
   * Recalculate commissions when a deal is marked as paid
   */
  async recalculateOnDealPaid(dealId: string, userId: string) {
    const supabase = createServerClient()

    // Get the deal
    const { data: deal, error } = await supabase
      .from('deals')
      .select('organization_id, bdm_id, month_paid')
      .eq('id', dealId)
      .single()

    if (error || !deal || !deal.month_paid) {
      console.error('Error fetching deal:', error)
      return
    }

    const paidDate = new Date(deal.month_paid)
    const month = paidDate.getMonth() + 1
    const year = paidDate.getFullYear()

    // Recalculate BDM commission for this month
    const bdmCommission = await this.calculateMonthlyBDMCommission(
      deal.organization_id,
      deal.bdm_id,
      month,
      year
    )

    // Save the record
    await this.saveCommissionRecord(deal.organization_id, bdmCommission, userId)
  }
}

// Export singleton instance
export const commissionCalculator = new CommissionCalculator()
