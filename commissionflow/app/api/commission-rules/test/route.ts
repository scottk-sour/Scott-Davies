// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { commissionDryRun } from '@/lib/commission-dry-run'
import type { DryRunRequest, CommissionRule } from '@/types/commission'
import { z } from 'zod'

// =====================================================
// COMMISSION RULES DRY RUN API
// Phase 1A: Test proposed rules on historical data
// =====================================================

// Validation schema for dry run request
const dryRunRequestSchema = z.object({
  proposed_rules: z.array(z.object({
    name: z.string(),
    rule_type: z.enum(['percentage', 'flat', 'threshold', 'tiered', 'accelerator', 'bonus']),
    applies_to_role: z.enum(['sales_rep', 'team_lead', 'manager', 'accounts', 'director']).nullable().optional(),
    applies_to_user_ids: z.array(z.string().uuid()).nullable().optional(),
    config: z.record(z.any()),
    priority: z.number().int().min(0).max(1000).default(0),
    stacking_behavior: z.enum(['replace', 'add', 'multiply', 'highest']).default('replace'),
    is_absolute: z.boolean().default(false),
  })),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  user_ids: z.array(z.string().uuid()).optional(),
})

/**
 * POST /api/commission-rules/test
 * Run a dry run simulation to test proposed rules on historical data
 *
 * This is a "what-if" calculator that:
 * 1. Calculates commissions using CURRENT rules
 * 2. Calculates commissions using PROPOSED rules
 * 3. Shows difference per user and overall
 * 4. Estimates budget impact (monthly, quarterly, annual)
 * 5. Generates warnings for significant changes
 *
 * Body:
 * {
 *   proposed_rules: CommissionRule[] - Rules to test
 *   period_start: string - Start date (YYYY-MM-DD)
 *   period_end: string - End date (YYYY-MM-DD)
 *   user_ids?: string[] - Optional: specific users to test (default: all active)
 * }
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
    const { data: user } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      )
    }

    // Check permissions - only managers and directors can run dry runs
    if (!['manager', 'director'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: { message: 'Insufficient permissions. Only managers and directors can run dry run simulations.' } },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = dryRunRequestSchema.parse(body)

    // Validate date range
    const periodStart = new Date(validatedData.period_start)
    const periodEnd = new Date(validatedData.period_end)

    if (periodEnd <= periodStart) {
      return NextResponse.json(
        { success: false, error: { message: 'period_end must be after period_start' } },
        { status: 400 }
      )
    }

    // Check if date range is too large (max 12 months for performance)
    const monthsDiff = (periodEnd.getFullYear() - periodStart.getFullYear()) * 12
      + (periodEnd.getMonth() - periodStart.getMonth())

    if (monthsDiff > 12) {
      return NextResponse.json(
        { success: false, error: { message: 'Date range cannot exceed 12 months for dry run simulations' } },
        { status: 400 }
      )
    }

    // If user_ids provided, verify they belong to user's organization
    if (validatedData.user_ids && validatedData.user_ids.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', user.organization_id)
        .in('id', validatedData.user_ids)

      if (!users || users.length !== validatedData.user_ids.length) {
        return NextResponse.json(
          { success: false, error: { message: 'Some user IDs do not belong to your organization' } },
          { status: 400 }
        )
      }
    }

    // Prepare dry run request with organization context
    const dryRunRequest: DryRunRequest = {
      proposed_rules: validatedData.proposed_rules.map(rule => ({
        ...rule,
        id: `temp-${Math.random().toString(36).substr(2, 9)}`,
        organization_id: user.organization_id,
        active: true,
        effective_from: periodStart,
        effective_to: periodEnd,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: session.user.id,
        updated_by: session.user.id,
        description: null,
      })) as CommissionRule[],
      period_start: periodStart,
      period_end: periodEnd,
      user_ids: validatedData.user_ids,
    }

    // Run the dry run simulation
    const result = await commissionDryRun.simulate(dryRunRequest)

    // Get user names for better reporting
    const allUserIds = [
      ...Object.keys(result.current_results.by_user),
      ...Object.keys(result.proposed_results.by_user),
    ]
    const uniqueUserIds = [...new Set(allUserIds)]

    const { data: users } = await supabase
      .from('users')
      .select('id, name')
      .in('id', uniqueUserIds)

    const userNames: Record<string, string> = {}
    if (users) {
      for (const u of users) {
        userNames[u.id] = u.name
      }
    }

    // Generate summary report
    const summaryReport = commissionDryRun.generateSummaryReport(result, userNames)

    return NextResponse.json({
      success: true,
      data: {
        result,
        summary_report: summaryReport,
        user_names: userNames,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Validation error',
            details: error.errors,
          },
        },
        { status: 400 }
      )
    }

    console.error('Unexpected error in POST /api/commission-rules/test:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

/**
 * GET /api/commission-rules/test/status
 * Check if dry run testing is available for the organization
 *
 * Requirements:
 * - At least 1 active user
 * - At least 1 paid deal in the last 6 months
 * - At least 1 active commission rule
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

    // Get user's organization
    const { data: user } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      )
    }

    // Check requirements
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const [
      { count: activeUsersCount },
      { count: paidDealsCount },
      { count: activeRulesCount },
    ] = await Promise.all([
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', user.organization_id)
        .eq('active', true),
      supabase
        .from('deals')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', user.organization_id)
        .eq('status', 'paid')
        .gte('month_paid', sixMonthsAgo.toISOString()),
      supabase
        .from('commission_rules')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', user.organization_id)
        .eq('active', true),
    ])

    const requirements = {
      active_users: {
        met: (activeUsersCount || 0) > 0,
        count: activeUsersCount || 0,
        message: 'At least 1 active user required',
      },
      paid_deals: {
        met: (paidDealsCount || 0) > 0,
        count: paidDealsCount || 0,
        message: 'At least 1 paid deal in the last 6 months required',
      },
      active_rules: {
        met: (activeRulesCount || 0) > 0,
        count: activeRulesCount || 0,
        message: 'At least 1 active commission rule required',
      },
    }

    const allRequirementsMet = Object.values(requirements).every(r => r.met)

    return NextResponse.json({
      success: true,
      data: {
        available: allRequirementsMet,
        requirements,
        message: allRequirementsMet
          ? 'Dry run testing is available'
          : 'Some requirements not met. See requirements for details.',
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/commission-rules/test/status:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
