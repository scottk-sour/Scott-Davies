// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { z } from 'zod'

// =====================================================
// COMMISSION HISTORY API
// Phase 1A: View historical commission calculations
// =====================================================

/**
 * GET /api/commissions/history
 * Get commission calculation history for users
 *
 * Query params:
 * - user_id: string - Filter by user ID (optional)
 * - status: string - Filter by status (optional)
 * - period_start: string - Filter from date (YYYY-MM-DD, optional)
 * - period_end: string - Filter to date (YYYY-MM-DD, optional)
 * - limit: number - Number of results (default: 50, max: 100)
 * - offset: number - Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    // Get user's organization and role
    const { data: currentUser } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', session.user.id)
      .single()

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const userIdFilter = searchParams.get('user_id')
    const statusFilter = searchParams.get('status')
    const periodStartFilter = searchParams.get('period_start')
    const periodEndFilter = searchParams.get('period_end')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build base query
    let query = supabase
      .from('commission_calculations')
      .select(`
        *,
        user:users!commission_calculations_user_id_fkey(id, name, role),
        approved_by_manager:users!commission_calculations_approved_by_manager_fkey(id, name),
        approved_by_accounts:users!commission_calculations_approved_by_accounts_fkey(id, name)
      `, { count: 'exact' })
      .eq('organization_id', currentUser.organization_id)
      .order('calculation_period_end', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters based on permissions
    if (['sales_rep', 'team_lead'].includes(currentUser.role)) {
      // Non-managers can only see their own commissions
      query = query.eq('user_id', session.user.id)
    } else if (userIdFilter) {
      // Managers, directors, accounts can filter by user
      query = query.eq('user_id', userIdFilter)
    }

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    if (periodStartFilter) {
      query = query.gte('calculation_period_start', periodStartFilter)
    }

    if (periodEndFilter) {
      query = query.lte('calculation_period_end', periodEndFilter)
    }

    const { data: calculations, error, count } = await query

    if (error) {
      console.error('Error fetching commission history:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Failed to fetch commission history' } },
        { status: 500 }
      )
    }

    // Calculate summary statistics
    const summary = {
      total_calculations: count || 0,
      total_amount: calculations?.reduce((sum, c) => sum + c.total_amount, 0) || 0,
      by_status: calculations?.reduce((acc: any, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1
        return acc
      }, {}) || {},
    }

    return NextResponse.json({
      success: true,
      data: {
        calculations,
        summary,
        pagination: {
          limit,
          offset,
          total: count || 0,
          has_more: (offset + limit) < (count || 0),
        },
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/commissions/history:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

/**
 * GET /api/commissions/history/summary
 * Get summary statistics of commission history
 *
 * Query params:
 * - user_id: string - Filter by user ID (optional)
 * - period_start: string - Filter from date (YYYY-MM-DD, optional)
 * - period_end: string - Filter to date (YYYY-MM-DD, optional)
 * - group_by: 'month' | 'quarter' | 'year' (default: 'month')
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    // Get user's organization and role
    const { data: currentUser } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', session.user.id)
      .single()

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const userIdFilter = searchParams.get('user_id')
    const periodStartFilter = searchParams.get('period_start')
    const periodEndFilter = searchParams.get('period_end')
    const groupBy = searchParams.get('group_by') || 'month'

    // Build base query
    let query = supabase
      .from('commission_calculations')
      .select('*')
      .eq('organization_id', currentUser.organization_id)

    // Apply filters based on permissions
    if (['sales_rep', 'team_lead'].includes(currentUser.role)) {
      query = query.eq('user_id', session.user.id)
    } else if (userIdFilter) {
      query = query.eq('user_id', userIdFilter)
    }

    if (periodStartFilter) {
      query = query.gte('calculation_period_start', periodStartFilter)
    }

    if (periodEndFilter) {
      query = query.lte('calculation_period_end', periodEndFilter)
    }

    const { data: calculations, error } = await query

    if (error) {
      console.error('Error fetching commission summary:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Failed to fetch commission summary' } },
        { status: 500 }
      )
    }

    // Group calculations by period
    const grouped: Record<string, any> = {}

    for (const calc of calculations || []) {
      const date = new Date(calc.calculation_period_end)
      let periodKey: string

      switch (groupBy) {
        case 'year':
          periodKey = date.getFullYear().toString()
          break
        case 'quarter':
          periodKey = `${date.getFullYear()}-Q${Math.floor(date.getMonth() / 3) + 1}`
          break
        case 'month':
        default:
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
      }

      if (!grouped[periodKey]) {
        grouped[periodKey] = {
          period: periodKey,
          total_amount: 0,
          calculation_count: 0,
          by_status: {},
        }
      }

      grouped[periodKey].total_amount += calc.total_amount
      grouped[periodKey].calculation_count += 1
      grouped[periodKey].by_status[calc.status] = (grouped[periodKey].by_status[calc.status] || 0) + 1
    }

    // Convert to array and sort by period
    const summaryByPeriod = Object.values(grouped).sort((a: any, b: any) => {
      return a.period.localeCompare(b.period)
    })

    // Calculate overall statistics
    const overallSummary = {
      total_calculations: calculations?.length || 0,
      total_amount: calculations?.reduce((sum, c) => sum + c.total_amount, 0) || 0,
      average_amount: calculations?.length
        ? Math.round((calculations.reduce((sum, c) => sum + c.total_amount, 0) || 0) / calculations.length)
        : 0,
      by_status: calculations?.reduce((acc: any, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1
        return acc
      }, {}) || {},
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: overallSummary,
        by_period: summaryByPeriod,
        group_by: groupBy,
      },
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/commissions/history/summary:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
