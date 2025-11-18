// @ts-nocheck
'use client'

import { useState } from 'react'
import type { DryRunRequest, DryRunResult } from '@/types/commission'

// =====================================================
// DRY RUN TESTING HOOK
// Phase 1A: Test commission rules on historical data
// =====================================================

interface DryRunOptions extends Omit<DryRunRequest, 'proposed_rules'> {
  proposed_rules: Array<{
    name: string
    rule_type: 'percentage' | 'flat' | 'threshold' | 'tiered' | 'accelerator' | 'bonus'
    applies_to_role?: string | null
    applies_to_user_ids?: string[] | null
    config: Record<string, any>
    priority?: number
    stacking_behavior?: 'replace' | 'add' | 'multiply' | 'highest'
    is_absolute?: boolean
  }>
}

interface DryRunTestResult {
  success: boolean
  result?: DryRunResult
  summary_report?: string
  user_names?: Record<string, string>
  error?: string
}

interface DryRunAvailability {
  available: boolean
  requirements: {
    active_users: { met: boolean; count: number; message: string }
    paid_deals: { met: boolean; count: number; message: string }
    active_rules: { met: boolean; count: number; message: string }
  }
  message: string
}

/**
 * Hook for dry run testing commission rules
 *
 * This hook allows testing proposed rules on historical data
 * before deploying them to production.
 *
 * @example
 * ```tsx
 * const { runDryRun, isRunning, result } = useDryRun()
 *
 * const handleTest = async () => {
 *   const testResult = await runDryRun({
 *     proposed_rules: [{
 *       name: 'New Base Commission',
 *       rule_type: 'percentage',
 *       config: { rate: 0.12 },
 *       priority: 10,
 *     }],
 *     period_start: new Date('2024-12-01'),
 *     period_end: new Date('2024-12-31'),
 *   })
 *
 *   if (testResult.success) {
 *     console.log('Impact:', testResult.result?.difference.total_change_percent)
 *   }
 * }
 * ```
 */
export function useDryRun() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<DryRunResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runDryRun = async (options: DryRunOptions): Promise<DryRunTestResult> => {
    setIsRunning(true)
    setError(null)
    setResult(null)

    try {
      // Validate dates
      const periodStart = options.period_start instanceof Date
        ? options.period_start.toISOString().split('T')[0]
        : options.period_start

      const periodEnd = options.period_end instanceof Date
        ? options.period_end.toISOString().split('T')[0]
        : options.period_end

      const res = await fetch('/api/commission-rules/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposed_rules: options.proposed_rules,
          period_start: periodStart,
          period_end: periodEnd,
          user_ids: options.user_ids,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMessage = data.error?.message || 'Failed to run dry run test'
        setError(errorMessage)
        return {
          success: false,
          error: errorMessage,
        }
      }

      setResult(data.data.result)

      return {
        success: true,
        result: data.data.result,
        summary_report: data.data.summary_report,
        user_names: data.data.user_names,
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Network error'
      setError(errorMessage)
      return {
        success: false,
        error: errorMessage,
      }
    } finally {
      setIsRunning(false)
    }
  }

  const clearResult = () => {
    setResult(null)
    setError(null)
  }

  return {
    runDryRun,
    isRunning,
    result,
    error,
    clearResult,
  }
}

/**
 * Hook for checking dry run availability
 *
 * Checks if the organization has the required data
 * to run dry run tests.
 *
 * @example
 * ```tsx
 * const { available, requirements, isLoading } = useDryRunAvailability()
 *
 * if (!available) {
 *   return <Alert>Dry run testing requires at least 1 paid deal</Alert>
 * }
 * ```
 */
export function useDryRunAvailability() {
  const [availability, setAvailability] = useState<DryRunAvailability | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAvailability = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/commission-rules/test/status')
      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message || 'Failed to check availability')
        return
      }

      setAvailability(data.data)
    } catch (err: any) {
      setError(err.message || 'Network error')
    } finally {
      setIsLoading(false)
    }
  }

  // Check on mount
  useState(() => {
    checkAvailability()
  })

  return {
    available: availability?.available ?? false,
    requirements: availability?.requirements,
    message: availability?.message,
    isLoading,
    error,
    refresh: checkAvailability,
  }
}

/**
 * Utility function to format dry run results for display
 */
export function formatDryRunResult(result: DryRunResult) {
  const { current_results, proposed_results, difference, budget_impact, warnings } = result

  return {
    summary: {
      current_total: current_results.total_commission,
      proposed_total: proposed_results.total_commission,
      change_amount: difference.total_change,
      change_percent: difference.total_change_percent,
      affected_users: difference.changes_by_user.length,
    },
    budgetImpact: {
      monthly: budget_impact.estimated_monthly_cost,
      quarterly: budget_impact.estimated_quarterly_cost,
      annual: budget_impact.estimated_annual_cost,
    },
    warnings: warnings || [],
    hasWarnings: (warnings?.length || 0) > 0,
    hasLargeChange: Math.abs(difference.total_change_percent) > 20,
    changeDirection: difference.total_change > 0 ? 'increase' : 'decrease',
  }
}

/**
 * Utility function to generate summary text for dry run results
 */
export function generateDryRunSummary(result: DryRunResult): string {
  const formatted = formatDryRunResult(result)
  const { summary, budgetImpact, warnings } = formatted

  const changeText = formatted.changeDirection === 'increase' ? 'increase' : 'decrease'
  const changeSign = formatted.changeDirection === 'increase' ? '+' : ''

  let text = `The proposed rules would ${changeText} total commissions by ${changeSign}${summary.change_percent.toFixed(1)}% `
  text += `(${changeSign}£${(summary.change_amount / 100).toFixed(2)}), `
  text += `affecting ${summary.affected_users} user${summary.affected_users !== 1 ? 's' : ''}.\n\n`

  text += `Budget Impact:\n`
  text += `- Monthly: ${changeSign}£${(budgetImpact.monthly / 100).toFixed(2)}\n`
  text += `- Quarterly: ${changeSign}£${(budgetImpact.quarterly / 100).toFixed(2)}\n`
  text += `- Annual: ${changeSign}£${(budgetImpact.annual / 100).toFixed(2)}\n`

  if (warnings.length > 0) {
    text += `\nWarnings:\n`
    warnings.forEach((warning) => {
      text += `- ${warning}\n`
    })
  }

  return text
}
