// @ts-nocheck
// =====================================================
// COMMISSION ENGINE V2
// Phase 1A: Flexible Commission Rules Calculator
// =====================================================

import { createServerClient } from './supabase/client'
import type {
  CommissionRule,
  CommissionCalculation,
  CalculationStep,
  CalculationInputData,
  RuleConfig,
  PercentageConfig,
  FlatConfig,
  ThresholdConfig,
  TieredConfig,
  AcceleratorConfig,
  BonusConfig,
  StackingBehavior,
} from '@/types/commission'
import {
  isPercentageConfig,
  isFlatConfig,
  isThresholdConfig,
  isTieredConfig,
  isAcceleratorConfig,
  isBonusConfig,
} from '@/types/commission'

export class CommissionEngineV2 {
  /**
   * Calculate commission for a user based on active rules
   *
   * @param organizationId - Organization ID
   * @param userId - User ID to calculate for
   * @param periodStart - Start of calculation period
   * @param periodEnd - End of calculation period
   * @returns Commission calculation with breakdown
   */
  async calculateCommission(
    organizationId: string,
    userId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<{
    calculation: CommissionCalculation
    steps: CalculationStep[]
  }> {
    const supabase = createServerClient()

    // 1. Get all applicable rules for this user
    const rules = await this.getApplicableRules(organizationId, userId, periodStart, periodEnd)

    if (rules.length === 0) {
      throw new Error(`No commission rules found for user ${userId}`)
    }

    // 2. Get deals and activities in this period
    const { deals, activities, totalSales, totalProfit } = await this.getPerformanceData(
      organizationId,
      userId,
      periodStart,
      periodEnd
    )

    // 3. Get previous deficit (for threshold rules)
    const previousDeficit = await this.getPreviousDeficit(
      organizationId,
      userId,
      periodStart
    )

    // 4. Build input data
    const inputData: CalculationInputData = {
      deals: deals.map(d => d.id),
      activities: {
        appointments: activities.filter(a => a.activity_type === 'appointment').length,
        demos: activities.filter(a => a.activity_type === 'demo').length,
        leads: activities.filter(a => a.activity_type === 'lead').length,
        calls: activities.filter(a => a.activity_type === 'call').length,
      },
      total_sales: totalSales,
      total_profit: totalProfit,
      previous_deficit: previousDeficit,
    }

    // 5. Apply rules in priority order (highest first)
    const sortedRules = this.sortRulesByPriority(rules)
    const steps: CalculationStep[] = []
    let commissionAmount = 0

    for (const rule of sortedRules) {
      const step = await this.applyRule(
        rule,
        inputData,
        commissionAmount,
        steps.length + 1
      )

      steps.push(step)

      if (step.status === 'applied') {
        // Apply stacking behavior
        commissionAmount = this.applyStacking(
          commissionAmount,
          step.result,
          rule.stacking_behavior
        )
      }
    }

    // 6. Create calculation record
    const calculation: CommissionCalculation = {
      id: crypto.randomUUID(),
      organization_id: organizationId,
      user_id: userId,
      rule_id: null, // Multiple rules applied
      calculation_period_start: periodStart,
      calculation_period_end: periodEnd,
      calculation_type: 'monthly',
      input_data: inputData,
      base_amount: commissionAmount,
      bonus_amount: 0,
      adjustments: 0,
      total_amount: commissionAmount,
      calculation_breakdown: steps,
      status: 'calculated',
      approved_by_manager: null,
      approved_by_manager_at: null,
      approved_by_accounts: null,
      approved_by_accounts_at: null,
      approved_for_payroll: null,
      approved_for_payroll_at: null,
      notes: null,
      dispute_reason: null,
      calculated_by: null, // Will be set by API
      calculated_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    }

    return { calculation, steps }
  }

  /**
   * Get all applicable rules for a user
   */
  private async getApplicableRules(
    organizationId: string,
    userId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<CommissionRule[]> {
    const supabase = createServerClient()

    // Get user's role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (!user) {
      throw new Error(`User ${userId} not found`)
    }

    // Get rules that apply to this user
    const { data: rules, error } = await supabase
      .from('commission_rules')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('active', true)
      .lte('effective_from', periodEnd.toISOString().split('T')[0])
      .or(`effective_to.is.null,effective_to.gte.${periodStart.toISOString().split('T')[0]}`)
      .or(`applies_to_role.eq.${user.role},applies_to_user_ids.cs.{${userId}}`)

    if (error) {
      throw new Error(`Failed to fetch rules: ${error.message}`)
    }

    return rules as CommissionRule[]
  }

  /**
   * Get performance data (deals, activities, sales, profit)
   */
  private async getPerformanceData(
    organizationId: string,
    userId: string,
    periodStart: Date,
    periodEnd: Date
  ) {
    const supabase = createServerClient()

    // Get deals paid in this period
    const { data: deals } = await supabase
      .from('deals')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('telesales_agent_id', userId)
      .eq('status', 'paid')
      .gte('month_paid', periodStart.toISOString())
      .lte('month_paid', periodEnd.toISOString())

    // Get activities in this period
    const { data: activities } = await supabase
      .from('sales_activities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .eq('verified', true)  // Only count verified activities
      .gte('activity_date', periodStart.toISOString().split('T')[0])
      .lte('activity_date', periodEnd.toISOString().split('T')[0])

    const totalSales = deals?.reduce((sum, d) => sum + d.deal_value, 0) || 0
    const totalProfit = deals?.reduce((sum, d) => sum + d.initial_profit, 0) || 0

    return {
      deals: deals || [],
      activities: activities || [],
      totalSales,
      totalProfit,
    }
  }

  /**
   * Get previous month's deficit (for threshold rules)
   */
  private async getPreviousDeficit(
    organizationId: string,
    userId: string,
    periodStart: Date
  ): Promise<number> {
    const supabase = createServerClient()

    // Get previous month
    const previousMonth = new Date(periodStart)
    previousMonth.setMonth(previousMonth.getMonth() - 1)

    const previousMonthStart = new Date(
      previousMonth.getFullYear(),
      previousMonth.getMonth(),
      1
    )
    const previousMonthEnd = new Date(
      previousMonth.getFullYear(),
      previousMonth.getMonth() + 1,
      0
    )

    // Look for previous calculation with deficit
    const { data } = await supabase
      .from('commission_calculations')
      .select('input_data')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .eq('calculation_period_start', previousMonthStart.toISOString().split('T')[0])
      .eq('calculation_period_end', previousMonthEnd.toISOString().split('T')[0])
      .single()

    if (data && data.input_data && 'deficit_to_next' in data.input_data) {
      return (data.input_data as any).deficit_to_next || 0
    }

    return 0
  }

  /**
   * Apply a single rule and return calculation step
   */
  private async applyRule(
    rule: CommissionRule,
    inputData: CalculationInputData,
    currentCommission: number,
    stepNumber: number
  ): Promise<CalculationStep> {
    switch (rule.rule_type) {
      case 'percentage':
        return this.applyPercentageRule(rule, inputData, stepNumber)

      case 'flat':
        return this.applyFlatRule(rule, inputData, stepNumber)

      case 'threshold':
        return this.applyThresholdRule(rule, inputData, currentCommission, stepNumber)

      case 'tiered':
        return this.applyTieredRule(rule, inputData, stepNumber)

      case 'accelerator':
        return this.applyAcceleratorRule(rule, inputData, currentCommission, stepNumber)

      case 'bonus':
        return this.applyBonusRule(rule, inputData, stepNumber)

      default:
        throw new Error(`Unknown rule type: ${rule.rule_type}`)
    }
  }

  /**
   * Apply percentage rule (e.g., 10% of profit)
   */
  private applyPercentageRule(
    rule: CommissionRule,
    inputData: CalculationInputData,
    stepNumber: number
  ): CalculationStep {
    if (!isPercentageConfig(rule.config)) {
      throw new Error('Invalid percentage config')
    }

    const config = rule.config as PercentageConfig
    const totalProfit = inputData.total_profit || 0
    const commission = Math.round(totalProfit * config.rate)

    return {
      step: stepNumber,
      rule_name: rule.name,
      rule_id: rule.id,
      rule_type: 'percentage',
      status: 'applied',
      formula: `£${(totalProfit / 100).toFixed(2)} × ${(config.rate * 100).toFixed(0)}%`,
      inputs: {
        total_profit: totalProfit,
        rate: config.rate,
      },
      result: commission,
      explanation: `Applied ${(config.rate * 100).toFixed(0)}% commission rate to total profit of £${(totalProfit / 100).toFixed(2)}, resulting in £${(commission / 100).toFixed(2)}.`,
      icon: '✅',
    }
  }

  /**
   * Apply flat rate rule (e.g., £100 per appointment)
   */
  private applyFlatRule(
    rule: CommissionRule,
    inputData: CalculationInputData,
    stepNumber: number
  ): CalculationStep {
    if (!isFlatConfig(rule.config)) {
      throw new Error('Invalid flat config')
    }

    const config = rule.config as FlatConfig
    const activityCount = inputData.activities?.[config.per as keyof typeof inputData.activities] || 0
    const commission = activityCount * config.amount

    if (activityCount === 0) {
      return {
        step: stepNumber,
        rule_name: rule.name,
        rule_id: rule.id,
        rule_type: 'flat',
        status: 'not_applied',
        inputs: { activity_count: activityCount, amount_per: config.amount },
        result: 0,
        explanation: `No ${config.per}s recorded this period.`,
        icon: '⏭️',
      }
    }

    return {
      step: stepNumber,
      rule_name: rule.name,
      rule_id: rule.id,
      rule_type: 'flat',
      status: 'applied',
      formula: `${activityCount} ${config.per}s × £${(config.amount / 100).toFixed(2)}`,
      inputs: {
        activity_count: activityCount,
        amount_per: config.amount,
      },
      result: commission,
      explanation: `Earned £${(config.amount / 100).toFixed(2)} for each of ${activityCount} ${config.per}s, totaling £${(commission / 100).toFixed(2)}.`,
      icon: '✅',
    }
  }

  /**
   * Apply threshold rule (e.g., must hit £3,500 to earn commission)
   */
  private applyThresholdRule(
    rule: CommissionRule,
    inputData: CalculationInputData,
    currentCommission: number,
    stepNumber: number
  ): CalculationStep {
    if (!isThresholdConfig(rule.config)) {
      throw new Error('Invalid threshold config')
    }

    const config = rule.config as ThresholdConfig
    const totalProfit = inputData.total_profit || 0
    const previousDeficit = inputData.previous_deficit || 0
    const thresholdNeeded = config.threshold + previousDeficit
    const thresholdMet = totalProfit >= thresholdNeeded

    if (!thresholdMet) {
      const deficitToNext = thresholdNeeded - totalProfit

      return {
        step: stepNumber,
        rule_name: rule.name,
        rule_id: rule.id,
        rule_type: 'threshold',
        status: 'not_applied',
        formula: `£${(totalProfit / 100).toFixed(2)} < £${(thresholdNeeded / 100).toFixed(2)}`,
        inputs: {
          total_profit: totalProfit,
          previous_deficit: previousDeficit,
          threshold_needed: thresholdNeeded,
          threshold_met: false,
          deficit_to_next: deficitToNext,
        },
        result: 0,
        explanation: `Threshold not met. Required £${(thresholdNeeded / 100).toFixed(2)} but achieved £${(totalProfit / 100).toFixed(2)}. Deficit of £${(deficitToNext / 100).toFixed(2)} carries to next month.`,
        icon: '❌',
      }
    }

    // Threshold met - calculate commission on excess
    const excess = totalProfit - thresholdNeeded
    const commission = Math.round(excess * config.rate)

    return {
      step: stepNumber,
      rule_name: rule.name,
      rule_id: rule.id,
      rule_type: 'threshold',
      status: 'applied',
      formula: `(£${(totalProfit / 100).toFixed(2)} - £${(thresholdNeeded / 100).toFixed(2)}) × ${(config.rate * 100).toFixed(0)}%`,
      inputs: {
        total_profit: totalProfit,
        previous_deficit: previousDeficit,
        threshold_needed: thresholdNeeded,
        threshold_met: true,
        excess: excess,
        rate: config.rate,
      },
      result: commission,
      explanation: `Threshold met! Exceeded threshold of £${(thresholdNeeded / 100).toFixed(2)} by £${(excess / 100).toFixed(2)}. Commission: £${(commission / 100).toFixed(2)} (${(config.rate * 100).toFixed(0)}% of excess). Deficit cleared.`,
      icon: '✅',
    }
  }

  /**
   * Apply tiered rule (different rates at different levels)
   */
  private applyTieredRule(
    rule: CommissionRule,
    inputData: CalculationInputData,
    stepNumber: number
  ): CalculationStep {
    if (!isTieredConfig(rule.config)) {
      throw new Error('Invalid tiered config')
    }

    const config = rule.config as TieredConfig
    const totalSales = inputData.total_sales || 0
    let commission = 0
    const tierBreakdown: any[] = []

    for (const tier of config.tiers) {
      const tierMin = tier.min
      const tierMax = tier.max || Infinity

      if (totalSales > tierMin) {
        const applicableAmount = Math.min(totalSales, tierMax) - tierMin
        const tierCommission = Math.round(applicableAmount * tier.rate)
        commission += tierCommission

        tierBreakdown.push({
          min: tierMin,
          max: tierMax,
          rate: tier.rate,
          amount: applicableAmount,
          commission: tierCommission,
        })
      }
    }

    return {
      step: stepNumber,
      rule_name: rule.name,
      rule_id: rule.id,
      rule_type: 'tiered',
      status: commission > 0 ? 'applied' : 'not_applied',
      formula: tierBreakdown
        .map(t => `£${(t.amount / 100).toFixed(2)} × ${(t.rate * 100).toFixed(0)}%`)
        .join(' + '),
      inputs: {
        total_sales: totalSales,
        tiers: tierBreakdown,
      },
      result: commission,
      explanation: `Calculated tiered commission across ${tierBreakdown.length} tier(s), totaling £${(commission / 100).toFixed(2)}.`,
      icon: commission > 0 ? '✅' : '⏭️',
    }
  }

  /**
   * Apply accelerator rule (rate increases after trigger)
   */
  private applyAcceleratorRule(
    rule: CommissionRule,
    inputData: CalculationInputData,
    currentCommission: number,
    stepNumber: number
  ): CalculationStep {
    if (!isAcceleratorConfig(rule.config)) {
      throw new Error('Invalid accelerator config')
    }

    const config = rule.config as AcceleratorConfig
    const totalSales = inputData.total_sales || 0
    const triggered = totalSales > config.trigger

    if (!triggered) {
      return {
        step: stepNumber,
        rule_name: rule.name,
        rule_id: rule.id,
        rule_type: 'accelerator',
        status: 'not_applied',
        inputs: {
          total_sales: totalSales,
          trigger: config.trigger,
          triggered: false,
        },
        result: 0,
        explanation: `Accelerator not triggered. Sales of £${(totalSales / 100).toFixed(2)} below trigger of £${(config.trigger / 100).toFixed(2)}.`,
        icon: '⏭️',
      }
    }

    // Recalculate with accelerated rate
    const totalProfit = inputData.total_profit || 0
    const newCommission = Math.round(totalProfit * config.accelerated_rate)
    const bonus = newCommission - currentCommission

    return {
      step: stepNumber,
      rule_name: rule.name,
      rule_id: rule.id,
      rule_type: 'accelerator',
      status: 'applied',
      formula: `£${(totalProfit / 100).toFixed(2)} × ${(config.accelerated_rate * 100).toFixed(0)}%`,
      inputs: {
        total_sales: totalSales,
        trigger: config.trigger,
        triggered: true,
        base_rate: config.base_rate,
        accelerated_rate: config.accelerated_rate,
        total_profit: totalProfit,
      },
      result: bonus,
      explanation: `Accelerator triggered! Sales exceeded £${(config.trigger / 100).toFixed(2)}. Rate increased from ${(config.base_rate * 100).toFixed(0)}% to ${(config.accelerated_rate * 100).toFixed(0)}%. Bonus: £${(bonus / 100).toFixed(2)}.`,
      icon: '✅',
    }
  }

  /**
   * Apply bonus rule (one-time bonus for achievement)
   */
  private applyBonusRule(
    rule: CommissionRule,
    inputData: CalculationInputData,
    stepNumber: number
  ): CalculationStep {
    if (!isBonusConfig(rule.config)) {
      throw new Error('Invalid bonus config')
    }

    const config = rule.config as BonusConfig
    const totalSales = inputData.total_sales || 0

    // Check condition
    let conditionMet = false
    let conditionDescription = ''

    if (config.condition.monthly_sales_above !== undefined) {
      conditionMet = totalSales > config.condition.monthly_sales_above
      conditionDescription = `Monthly sales > £${(config.condition.monthly_sales_above / 100).toFixed(2)}`
    }

    if (!conditionMet) {
      return {
        step: stepNumber,
        rule_name: rule.name,
        rule_id: rule.id,
        rule_type: 'bonus',
        status: 'not_applied',
        inputs: {
          condition: conditionDescription,
          condition_met: false,
          total_sales: totalSales,
        },
        result: 0,
        explanation: `Bonus condition not met: ${conditionDescription}`,
        icon: '⏭️',
      }
    }

    return {
      step: stepNumber,
      rule_name: rule.name,
      rule_id: rule.id,
      rule_type: 'bonus',
      status: 'applied',
      formula: `Bonus: £${(config.bonus / 100).toFixed(2)}`,
      inputs: {
        condition: conditionDescription,
        condition_met: true,
        bonus: config.bonus,
      },
      result: config.bonus,
      explanation: `Bonus achieved! ${conditionDescription}. Earned £${(config.bonus / 100).toFixed(2)}.`,
      icon: '✅',
    }
  }

  /**
   * Apply stacking behavior to combine rules
   */
  private applyStacking(
    current: number,
    newAmount: number,
    behavior: StackingBehavior
  ): number {
    switch (behavior) {
      case 'replace':
        return newAmount

      case 'add':
        return current + newAmount

      case 'multiply':
        return Math.round(current * (newAmount / 100))  // Treat newAmount as multiplier

      case 'highest':
        return Math.max(current, newAmount)

      default:
        return newAmount
    }
  }

  /**
   * Sort rules by priority (highest first)
   */
  private sortRulesByPriority(rules: CommissionRule[]): CommissionRule[] {
    return [...rules].sort((a, b) => b.priority - a.priority)
  }
}

// Export singleton instance
export const commissionEngineV2 = new CommissionEngineV2()
