// @ts-nocheck
// =====================================================
// COMMISSION DRY RUN / WHAT-IF CALCULATOR
// Phase 1A: Test rules on historical data before deploying
// =====================================================

import { createServerClient } from './supabase/client'
import { commissionEngineV2 } from './commission-engine-v2'
import type {
  CommissionRule,
  DryRunRequest,
  DryRunResult,
} from '@/types/commission'
import { penceToPounds, formatCurrency } from '@/types'

export class CommissionDryRun {
  /**
   * Run a dry run simulation to test proposed rules on historical data
   *
   * @param request - Dry run configuration
   * @returns Comparison of current vs proposed results
   */
  async simulate(request: DryRunRequest): Promise<DryRunResult> {
    const supabase = createServerClient()

    // 1. Determine which users to test
    const userIds = request.user_ids || await this.getAllActiveUsers(
      request.proposed_rules[0].organization_id
    )

    // 2. Calculate with CURRENT (production) rules
    const currentResults = await this.calculateWithCurrentRules(
      request.proposed_rules[0].organization_id,
      userIds,
      request.period_start,
      request.period_end
    )

    // 3. Calculate with PROPOSED rules
    const proposedResults = await this.calculateWithProposedRules(
      request.proposed_rules,
      userIds,
      request.period_start,
      request.period_end
    )

    // 4. Calculate differences
    const difference = this.calculateDifference(
      currentResults.by_user,
      proposedResults.by_user,
      userIds
    )

    // 5. Estimate budget impact
    const budgetImpact = this.estimateBudgetImpact(
      difference.total_change,
      request.period_start,
      request.period_end
    )

    // 6. Generate warnings
    const warnings = this.generateWarnings(
      currentResults,
      proposedResults,
      difference
    )

    return {
      current_results: currentResults,
      proposed_results: proposedResults,
      difference,
      budget_impact: budgetImpact,
      warnings,
    }
  }

  /**
   * Get all active users in organization
   */
  private async getAllActiveUsers(organizationId: string): Promise<string[]> {
    const supabase = createServerClient()

    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('active', true)

    return users?.map(u => u.id) || []
  }

  /**
   * Calculate commissions using current (production) rules
   */
  private async calculateWithCurrentRules(
    organizationId: string,
    userIds: string[],
    periodStart: Date,
    periodEnd: Date
  ): Promise<{
    total_commission: number
    by_user: Record<string, number>
  }> {
    const supabase = createServerClient()

    // Get current active rules
    const { data: currentRules } = await supabase
      .from('commission_rules')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('active', true)
      .lte('effective_from', periodEnd.toISOString().split('T')[0])
      .or(`effective_to.is.null,effective_to.gte.${periodStart.toISOString().split('T')[0]}`)

    const byUser: Record<string, number> = {}
    let total = 0

    for (const userId of userIds) {
      try {
        const { calculation } = await commissionEngineV2.calculateCommission(
          organizationId,
          userId,
          periodStart,
          periodEnd
        )

        byUser[userId] = calculation.total_amount
        total += calculation.total_amount
      } catch (error) {
        // User might have no applicable rules or no deals - that's okay
        byUser[userId] = 0
      }
    }

    return {
      total_commission: total,
      by_user: byUser,
    }
  }

  /**
   * Calculate commissions using proposed rules
   */
  private async calculateWithProposedRules(
    proposedRules: CommissionRule[],
    userIds: string[],
    periodStart: Date,
    periodEnd: Date
  ): Promise<{
    total_commission: number
    by_user: Record<string, number>
  }> {
    const supabase = createServerClient()
    const organizationId = proposedRules[0].organization_id

    // Temporarily insert proposed rules into a test scenario
    // We'll use the engine with the proposed rules
    // Note: This is a simulation - rules are NOT saved to database

    const byUser: Record<string, number> = {}
    let total = 0

    for (const userId of userIds) {
      try {
        // Simulate calculation with proposed rules
        // We need to mock the rules query in the engine
        // For now, we'll calculate manually with proposed rules

        const commission = await this.calculateWithSpecificRules(
          proposedRules,
          userId,
          periodStart,
          periodEnd
        )

        byUser[userId] = commission
        total += commission
      } catch (error) {
        byUser[userId] = 0
      }
    }

    return {
      total_commission: total,
      by_user: byUser,
    }
  }

  /**
   * Calculate commission using specific rules (not from database)
   * This is a simplified version of the main engine for dry run purposes
   */
  private async calculateWithSpecificRules(
    rules: CommissionRule[],
    userId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<number> {
    const supabase = createServerClient()

    // Get user's role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (!user) {
      return 0
    }

    // Filter rules that apply to this user
    const applicableRules = rules.filter(rule =>
      rule.applies_to_role === user.role ||
      (rule.applies_to_user_ids && rule.applies_to_user_ids.includes(userId))
    )

    if (applicableRules.length === 0) {
      return 0
    }

    // Get performance data
    const { deals, activities, totalSales, totalProfit } = await this.getPerformanceData(
      rules[0].organization_id,
      userId,
      periodStart,
      periodEnd
    )

    // Apply rules (simplified - just percentage for now)
    // TODO: Implement full rule application logic
    let commission = 0

    for (const rule of applicableRules) {
      if (rule.rule_type === 'percentage') {
        const config = rule.config as { rate: number }
        commission += Math.round(totalProfit * config.rate)
      }
      // Add other rule types as needed
    }

    return commission
  }

  /**
   * Get performance data for a user
   */
  private async getPerformanceData(
    organizationId: string,
    userId: string,
    periodStart: Date,
    periodEnd: Date
  ) {
    const supabase = createServerClient()

    const { data: deals } = await supabase
      .from('deals')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('telesales_agent_id', userId)
      .eq('status', 'paid')
      .gte('month_paid', periodStart.toISOString())
      .lte('month_paid', periodEnd.toISOString())

    const { data: activities } = await supabase
      .from('sales_activities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .eq('verified', true)
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
   * Calculate difference between current and proposed
   */
  private calculateDifference(
    currentByUser: Record<string, number>,
    proposedByUser: Record<string, number>,
    userIds: string[]
  ): {
    total_change: number
    total_change_percent: number
    by_user: Record<string, {
      current: number
      proposed: number
      change: number
      change_percent: number
      reason: string
    }>
  } {
    const byUser: Record<string, any> = {}
    let totalCurrentCommission = 0
    let totalProposedCommission = 0

    for (const userId of userIds) {
      const current = currentByUser[userId] || 0
      const proposed = proposedByUser[userId] || 0
      const change = proposed - current
      const changePercent = current > 0 ? (change / current) * 100 : (proposed > 0 ? 100 : 0)

      totalCurrentCommission += current
      totalProposedCommission += proposed

      byUser[userId] = {
        current,
        proposed,
        change,
        change_percent: changePercent,
        reason: this.explainChange(current, proposed, changePercent),
      }
    }

    const totalChange = totalProposedCommission - totalCurrentCommission
    const totalChangePercent = totalCurrentCommission > 0
      ? (totalChange / totalCurrentCommission) * 100
      : (totalProposedCommission > 0 ? 100 : 0)

    return {
      total_change: totalChange,
      total_change_percent: totalChangePercent,
      by_user: byUser,
    }
  }

  /**
   * Explain why commission changed
   */
  private explainChange(current: number, proposed: number, changePercent: number): string {
    if (proposed === current) {
      return 'No change'
    }

    if (proposed > current) {
      if (changePercent > 50) {
        return `Significant increase (+${changePercent.toFixed(0)}%) - likely due to rate increase or new bonus rules`
      } else if (changePercent > 20) {
        return `Moderate increase (+${changePercent.toFixed(0)}%) - new rules increase commission`
      } else {
        return `Small increase (+${changePercent.toFixed(0)}%)`
      }
    } else {
      if (changePercent < -50) {
        return `Significant decrease (${changePercent.toFixed(0)}%) - rate reduction or stricter thresholds`
      } else if (changePercent < -20) {
        return `Moderate decrease (${changePercent.toFixed(0)}%)`
      } else {
        return `Small decrease (${changePercent.toFixed(0)}%)`
      }
    }
  }

  /**
   * Estimate budget impact over different time periods
   */
  private estimateBudgetImpact(
    monthlyChange: number,
    periodStart: Date,
    periodEnd: Date
  ): {
    monthly: number
    quarterly: number
    annual: number
  } {
    // Calculate how many months are in the test period
    const monthsDiff = (periodEnd.getFullYear() - periodStart.getFullYear()) * 12
      + (periodEnd.getMonth() - periodStart.getMonth()) + 1

    const monthlyAverage = monthlyChange / monthsDiff

    return {
      monthly: Math.round(monthlyAverage),
      quarterly: Math.round(monthlyAverage * 3),
      annual: Math.round(monthlyAverage * 12),
    }
  }

  /**
   * Generate warnings about the proposed changes
   */
  private generateWarnings(
    currentResults: { total_commission: number; by_user: Record<string, number> },
    proposedResults: { total_commission: number; by_user: Record<string, number> },
    difference: { total_change: number; total_change_percent: number }
  ): string[] {
    const warnings: string[] = []

    // Warning 1: Large cost increase
    if (difference.total_change_percent > 30) {
      warnings.push(
        `⚠️ Commission costs will increase by ${difference.total_change_percent.toFixed(0)}% (${formatCurrency(penceToPounds(difference.total_change))}). ` +
        `Ensure this fits within budget.`
      )
    }

    // Warning 2: Large cost decrease (might demotivate team)
    if (difference.total_change_percent < -20) {
      warnings.push(
        `⚠️ Commission costs will decrease by ${Math.abs(difference.total_change_percent).toFixed(0)}%. ` +
        `This may negatively impact team morale and retention.`
      )
    }

    // Warning 3: Some users get much more, others get less
    const userChanges = Object.values(difference.by_user as Record<string, any>)
    const bigWinners = userChanges.filter(u => u.change_percent > 50).length
    const bigLosers = userChanges.filter(u => u.change_percent < -50).length

    if (bigWinners > 0 && bigLosers > 0) {
      warnings.push(
        `⚠️ Uneven impact: ${bigWinners} user(s) see 50%+ increase, while ${bigLosers} user(s) see 50%+ decrease. ` +
        `Consider reviewing fairness of new rules.`
      )
    }

    // Warning 4: No change (rules might be ineffective)
    if (Math.abs(difference.total_change_percent) < 1) {
      warnings.push(
        `ℹ️ Proposed rules have minimal impact (<1% change). Consider if changes are necessary.`
      )
    }

    // Warning 5: Very high commission (> 30% of revenue)
    // TODO: Calculate revenue from deals to determine this

    return warnings
  }

  /**
   * Generate a summary report for display
   */
  generateSummaryReport(result: DryRunResult, userNames?: Record<string, string>): string {
    let report = `DRY RUN SIMULATION RESULTS\n`
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

    // Overall summary
    report += `OVERALL IMPACT\n`
    report += `Current total: ${formatCurrency(penceToPounds(result.current_results.total_commission))}\n`
    report += `Proposed total: ${formatCurrency(penceToPounds(result.proposed_results.total_commission))}\n`
    report += `Difference: ${formatCurrency(penceToPounds(result.difference.total_change))} `
    report += `(${result.difference.total_change_percent >= 0 ? '+' : ''}${result.difference.total_change_percent.toFixed(1)}%)\n\n`

    // Budget impact
    report += `BUDGET IMPACT\n`
    report += `Monthly: ${formatCurrency(penceToPounds(result.budget_impact.monthly))}\n`
    report += `Quarterly: ${formatCurrency(penceToPounds(result.budget_impact.quarterly))}\n`
    report += `Annual: ${formatCurrency(penceToPounds(result.budget_impact.annual))}\n\n`

    // Warnings
    if (result.warnings.length > 0) {
      report += `WARNINGS\n`
      for (const warning of result.warnings) {
        report += `${warning}\n`
      }
      report += `\n`
    }

    // Top 5 biggest changes
    const sortedChanges = Object.entries(result.difference.by_user)
      .sort((a, b) => Math.abs(b[1].change) - Math.abs(a[1].change))
      .slice(0, 5)

    report += `TOP 5 BIGGEST CHANGES\n`
    for (const [userId, change] of sortedChanges) {
      const userName = userNames?.[userId] || userId
      report += `${userName}: ${formatCurrency(penceToPounds(change.current))} → ${formatCurrency(penceToPounds(change.proposed))} `
      report += `(${change.change >= 0 ? '+' : ''}${formatCurrency(penceToPounds(change.change))})\n`
    }

    return report
  }
}

// Export singleton instance
export const commissionDryRun = new CommissionDryRun()
