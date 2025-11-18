// @ts-nocheck
'use client'

import useSWR from 'swr'
import { useState } from 'react'
import type {
  CommissionCalculation,
  CalculationStep,
  CommissionExplanation,
} from '@/types/commission'

// =====================================================
// COMMISSION CALCULATION HOOK
// Phase 1A: Calculate and manage commissions
// =====================================================

interface CalculateCommissionOptions {
  user_id: string
  period_start: string
  period_end: string
  save_calculation?: boolean
}

interface CalculateCommissionResult {
  success: boolean
  calculation?: CommissionCalculation
  steps?: CalculationStep[]
  error?: string
}

interface UseCommissionHistoryOptions {
  userId?: string
  status?: string
  periodStart?: string
  periodEnd?: string
  limit?: number
  offset?: number
  autoRefresh?: boolean
}

interface CommissionHistoryData {
  calculations: CommissionCalculation[]
  summary: {
    total_calculations: number
    total_amount: number
    by_status: Record<string, number>
  }
  pagination: {
    limit: number
    offset: number
    total: number
    has_more: boolean
  }
}

const fetcher = async (url: string) => {
  const res = await fetch(url)

  if (!res.ok) {
    const error: any = new Error('Failed to fetch data')
    error.status = res.status
    error.info = await res.json()
    throw error
  }

  const data = await res.json()
  return data.data
}

/**
 * Hook for calculating commissions
 *
 * @example
 * ```tsx
 * const { calculateCommission, isCalculating } = useCommissionCalculation()
 *
 * const handleCalculate = async () => {
 *   const result = await calculateCommission({
 *     user_id: 'user-123',
 *     period_start: '2025-01-01',
 *     period_end: '2025-01-31',
 *     save_calculation: true,
 *   })
 *
 *   if (result.success) {
 *     console.log('Commission:', result.calculation.total_amount)
 *   }
 * }
 * ```
 */
export function useCommissionCalculation() {
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateCommission = async (
    options: CalculateCommissionOptions
  ): Promise<CalculateCommissionResult> => {
    setIsCalculating(true)

    try {
      const res = await fetch('/api/commissions/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      })

      const result = await res.json()

      if (!res.ok) {
        return {
          success: false,
          error: result.error?.message || 'Failed to calculate commission',
        }
      }

      return {
        success: true,
        calculation: result.data.calculation,
        steps: result.data.steps,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      }
    } finally {
      setIsCalculating(false)
    }
  }

  return {
    calculateCommission,
    isCalculating,
  }
}

/**
 * Hook for batch calculating commissions for multiple users
 *
 * @example
 * ```tsx
 * const { calculateBatch, isCalculating, progress } = useBatchCommissionCalculation()
 *
 * const handleBatchCalculate = async () => {
 *   const result = await calculateBatch({
 *     period_start: '2025-01-01',
 *     period_end: '2025-01-31',
 *     user_ids: ['user-1', 'user-2', 'user-3'],
 *   })
 * }
 * ```
 */
export function useBatchCommissionCalculation() {
  const [isCalculating, setIsCalculating] = useState(false)
  const [progress, setProgress] = useState<{
    current: number
    total: number
    percentage: number
  } | null>(null)

  const calculateBatch = async (options: {
    period_start: string
    period_end: string
    user_ids?: string[]
    save_calculations?: boolean
  }) => {
    setIsCalculating(true)
    setProgress(null)

    try {
      const params = new URLSearchParams()
      params.append('period_start', options.period_start)
      params.append('period_end', options.period_end)
      if (options.user_ids) params.append('user_ids', options.user_ids.join(','))
      if (options.save_calculations === false) params.append('save_calculations', 'false')

      const res = await fetch(`/api/commissions/calculate/batch?${params.toString()}`)
      const result = await res.json()

      if (!res.ok) {
        return {
          success: false,
          error: result.error?.message || 'Failed to calculate batch commissions',
        }
      }

      return {
        success: true,
        data: result.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      }
    } finally {
      setIsCalculating(false)
      setProgress(null)
    }
  }

  return {
    calculateBatch,
    isCalculating,
    progress,
  }
}

/**
 * Hook for fetching commission calculation history
 *
 * @example
 * ```tsx
 * const { calculations, summary, isLoading, loadMore } = useCommissionHistory({
 *   userId: 'user-123',
 *   status: 'approved',
 *   limit: 20,
 * })
 * ```
 */
export function useCommissionHistory(options: UseCommissionHistoryOptions = {}) {
  const {
    userId,
    status,
    periodStart,
    periodEnd,
    limit = 50,
    offset = 0,
    autoRefresh = false,
  } = options

  // Build query string
  const params = new URLSearchParams()
  if (userId) params.append('user_id', userId)
  if (status) params.append('status', status)
  if (periodStart) params.append('period_start', periodStart)
  if (periodEnd) params.append('period_end', periodEnd)
  params.append('limit', limit.toString())
  params.append('offset', offset.toString())

  const queryString = params.toString()
  const url = `/api/commissions/history${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate } = useSWR<CommissionHistoryData>(
    url,
    fetcher,
    {
      revalidateOnFocus: autoRefresh,
      refreshInterval: autoRefresh ? 30000 : 0,
    }
  )

  const loadMore = () => {
    // Implement load more by updating offset
    // This would typically be handled by the parent component
    mutate()
  }

  return {
    calculations: data?.calculations,
    summary: data?.summary,
    pagination: data?.pagination,
    isLoading,
    isError: error,
    refresh: mutate,
    loadMore,
  }
}

/**
 * Hook for fetching a commission explanation
 *
 * @example
 * ```tsx
 * const { explanation, isLoading, emailExplanation } = useCommissionExplanation(calculationId)
 *
 * const handleEmail = async () => {
 *   await emailExplanation('user@example.com')
 * }
 * ```
 */
export function useCommissionExplanation(calculationId: string | null) {
  const [isEmailing, setIsEmailing] = useState(false)

  const url = calculationId
    ? `/api/commissions/${calculationId}/explain?format=json`
    : null

  const { data, error, isLoading, mutate } = useSWR<CommissionExplanation>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const emailExplanation = async (recipientEmail?: string) => {
    if (!calculationId) return { success: false, error: 'No calculation ID' }

    setIsEmailing(true)

    try {
      const res = await fetch(`/api/commissions/${calculationId}/explain/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_email: recipientEmail,
          include_attachments: true,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        return {
          success: false,
          error: result.error?.message || 'Failed to email explanation',
        }
      }

      return {
        success: true,
        data: result.data,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      }
    } finally {
      setIsEmailing(false)
    }
  }

  const downloadText = () => {
    if (!calculationId) return

    window.open(`/api/commissions/${calculationId}/explain?format=text`, '_blank')
  }

  const downloadHtml = () => {
    if (!calculationId) return

    window.open(`/api/commissions/${calculationId}/explain?format=html`, '_blank')
  }

  return {
    explanation: data,
    isLoading,
    isError: error,
    isEmailing,
    emailExplanation,
    downloadText,
    downloadHtml,
    refresh: mutate,
  }
}
