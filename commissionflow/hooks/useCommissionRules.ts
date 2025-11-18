// @ts-nocheck
'use client'

import useSWR from 'swr'
import { useState } from 'react'
import type { CommissionRule, RuleConflict } from '@/types/commission'

// =====================================================
// COMMISSION RULES HOOK
// Phase 1A: Manage commission rules with SWR
// =====================================================

interface UseCommissionRulesOptions {
  activeOnly?: boolean
  role?: string
  userId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseCommissionRulesReturn {
  rules: CommissionRule[] | undefined
  isLoading: boolean
  isError: any
  count: number
  mutate: () => void
  createRule: (data: CreateRuleData) => Promise<CreateRuleResult>
  updateRule: (id: string, data: UpdateRuleData) => Promise<UpdateRuleResult>
  deleteRule: (id: string) => Promise<DeleteRuleResult>
  refreshRules: () => void
}

interface CreateRuleData {
  name: string
  description?: string
  rule_type: 'percentage' | 'flat' | 'threshold' | 'tiered' | 'accelerator' | 'bonus'
  applies_to_role?: string | null
  applies_to_user_ids?: string[] | null
  config: Record<string, any>
  priority?: number
  stacking_behavior?: 'replace' | 'add' | 'multiply' | 'highest'
  is_absolute?: boolean
  effective_from: string
  effective_to?: string | null
}

interface UpdateRuleData {
  name?: string
  description?: string
  config?: Record<string, any>
  priority?: number
  stacking_behavior?: 'replace' | 'add' | 'multiply' | 'highest'
  is_absolute?: boolean
  effective_from?: string
  effective_to?: string | null
  active?: boolean
}

interface CreateRuleResult {
  success: boolean
  rule?: CommissionRule
  warnings?: RuleConflict[]
  error?: string
}

interface UpdateRuleResult {
  success: boolean
  rule?: CommissionRule
  warnings?: RuleConflict[]
  error?: string
}

interface DeleteRuleResult {
  success: boolean
  rule?: CommissionRule
  error?: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)

  if (!res.ok) {
    const error: any = new Error('Failed to fetch commission rules')
    error.status = res.status
    error.info = await res.json()
    throw error
  }

  const data = await res.json()
  return data.data
}

/**
 * Hook for managing commission rules
 *
 * @param options Configuration options
 * @returns Rules data and CRUD functions
 *
 * @example
 * ```tsx
 * const { rules, isLoading, createRule } = useCommissionRules({
 *   activeOnly: true,
 *   autoRefresh: true,
 * })
 *
 * const handleCreate = async () => {
 *   const result = await createRule({
 *     name: 'Base Commission',
 *     rule_type: 'percentage',
 *     config: { rate: 0.10 },
 *     effective_from: '2025-01-01',
 *   })
 * }
 * ```
 */
export function useCommissionRules(options: UseCommissionRulesOptions = {}): UseCommissionRulesReturn {
  const {
    activeOnly = true,
    role,
    userId,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options

  // Build query string
  const params = new URLSearchParams()
  if (!activeOnly) params.append('active_only', 'false')
  if (role) params.append('role', role)
  if (userId) params.append('user_id', userId)

  const queryString = params.toString()
  const url = `/api/commission-rules${queryString ? `?${queryString}` : ''}`

  // Fetch rules with SWR
  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateOnFocus: autoRefresh,
      refreshInterval: autoRefresh ? refreshInterval : 0,
      dedupingInterval: 5000,
    }
  )

  /**
   * Create a new commission rule
   */
  const createRule = async (ruleData: CreateRuleData): Promise<CreateRuleResult> => {
    try {
      const res = await fetch('/api/commission-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData),
      })

      const result = await res.json()

      if (!res.ok) {
        // Handle conflict errors (409)
        if (res.status === 409 && result.error?.conflicts) {
          return {
            success: false,
            error: result.error.message,
            warnings: result.error.conflicts,
          }
        }

        return {
          success: false,
          error: result.error?.message || 'Failed to create rule',
        }
      }

      // Refresh the rules list
      await mutate()

      return {
        success: true,
        rule: result.data.rule,
        warnings: result.data.warnings,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      }
    }
  }

  /**
   * Update an existing commission rule
   */
  const updateRule = async (id: string, updates: UpdateRuleData): Promise<UpdateRuleResult> => {
    try {
      const res = await fetch(`/api/commission-rules/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const result = await res.json()

      if (!res.ok) {
        // Handle conflict errors (409)
        if (res.status === 409 && result.error?.conflicts) {
          return {
            success: false,
            error: result.error.message,
            warnings: result.error.conflicts,
          }
        }

        return {
          success: false,
          error: result.error?.message || 'Failed to update rule',
        }
      }

      // Refresh the rules list
      await mutate()

      return {
        success: true,
        rule: result.data.rule,
        warnings: result.data.warnings,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      }
    }
  }

  /**
   * Deactivate a commission rule (soft delete)
   */
  const deleteRule = async (id: string): Promise<DeleteRuleResult> => {
    try {
      const res = await fetch(`/api/commission-rules/${id}`, {
        method: 'DELETE',
      })

      const result = await res.json()

      if (!res.ok) {
        return {
          success: false,
          error: result.error?.message || 'Failed to delete rule',
        }
      }

      // Refresh the rules list
      await mutate()

      return {
        success: true,
        rule: result.data.rule,
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
      }
    }
  }

  /**
   * Manually refresh rules list
   */
  const refreshRules = () => {
    mutate()
  }

  return {
    rules: data?.rules,
    isLoading,
    isError: error,
    count: data?.count || 0,
    mutate,
    createRule,
    updateRule,
    deleteRule,
    refreshRules,
  }
}

/**
 * Hook for fetching a single commission rule with history
 */
export function useCommissionRule(ruleId: string | null) {
  const url = ruleId ? `/api/commission-rules/${ruleId}` : null

  const { data, error, isLoading, mutate } = useSWR(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return {
    rule: data?.rule as CommissionRule | undefined,
    history: data?.history || [],
    isLoading,
    isError: error,
    refresh: mutate,
  }
}
