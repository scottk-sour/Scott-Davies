// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { commissionEngineV2 } from '@/lib/commission-engine-v2'
import { z } from 'zod'

// =====================================================
// COMMISSION CALCULATION API
// Phase 1A: Calculate commissions using the new flexible rules engine
// =====================================================

// Validation schema for calculation request
const calculateRequestSchema = z.object({
  user_id: z.string().uuid(),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  save_calculation: z.boolean().default(true),
})

/**
 * POST /api/commissions/calculate
 * Calculate commission for a specific user and period
 *
 * Body:
 * {
 *   user_id: string - User to calculate for
 *   period_start: string - Start date (YYYY-MM-DD)
 *   period_end: string - End date (YYYY-MM-DD)
 *   save_calculation: boolean - Whether to save to database (default: true)
 * }
 *
 * Returns:
 * {
 *   calculation: CommissionCalculation - The calculated commission
 *   steps: CalculationStep[] - Step-by-step breakdown
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = calculateRequestSchema.parse(body)

    // Validate date range
    const periodStart = new Date(validatedData.period_start)
    const periodEnd = new Date(validatedData.period_end)

    if (periodEnd <= periodStart) {
      return NextResponse.json(
        { success: false, error: { message: 'period_end must be after period_start' } },
        { status: 400 }
      )
    }

    // Get the target user to verify they belong to same organization
    const { data: targetUser } = await supabase
      .from('users')
      .select('organization_id, name, role')
      .eq('id', validatedData.user_id)
      .single()

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: { message: 'Target user not found' } },
        { status: 404 }
      )
    }

    if (targetUser.organization_id !== currentUser.organization_id) {
      return NextResponse.json(
        { success: false, error: { message: 'Cannot calculate commissions for users in other organizations' } },
        { status: 403 }
      )
    }

    // Check permissions
    // Users can calculate their own commissions
    // Managers and directors can calculate anyone's commissions
    // Accounts can calculate anyone's commissions
    const canCalculate =
      validatedData.user_id === session.user.id ||
      ['manager', 'director', 'accounts'].includes(currentUser.role)

    if (!canCalculate) {
      return NextResponse.json(
        { success: false, error: { message: 'Insufficient permissions. You can only calculate your own commissions.' } },
        { status: 403 }
      )
    }

    // Run the calculation
    const result = await commissionEngineV2.calculateCommission(
      currentUser.organization_id,
      validatedData.user_id,
      periodStart,
      periodEnd,
      validatedData.save_calculation
    )

    return NextResponse.json({
      success: true,
      data: {
        calculation: result.calculation,
        steps: result.steps,
        user: {
          id: validatedData.user_id,
          name: targetUser.name,
          role: targetUser.role,
        },
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

    console.error('Unexpected error in POST /api/commissions/calculate:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

/**
 * GET /api/commissions/calculate/batch
 * Calculate commissions for multiple users in a single request
 *
 * Query params:
 * - period_start: string - Start date (YYYY-MM-DD)
 * - period_end: string - End date (YYYY-MM-DD)
 * - user_ids: string - Comma-separated user IDs (optional, default: all active users)
 * - save_calculations: boolean - Whether to save to database (default: true)
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

    // Only managers, directors, and accounts can calculate batch commissions
    if (!['manager', 'director', 'accounts'].includes(currentUser.role)) {
      return NextResponse.json(
        { success: false, error: { message: 'Insufficient permissions. Only managers, directors, and accounts can calculate batch commissions.' } },
        { status: 403 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const periodStartStr = searchParams.get('period_start')
    const periodEndStr = searchParams.get('period_end')
    const userIdsStr = searchParams.get('user_ids')
    const saveCalculations = searchParams.get('save_calculations') !== 'false'

    if (!periodStartStr || !periodEndStr) {
      return NextResponse.json(
        { success: false, error: { message: 'period_start and period_end are required' } },
        { status: 400 }
      )
    }

    // Validate dates
    const periodStart = new Date(periodStartStr)
    const periodEnd = new Date(periodEndStr)

    if (periodEnd <= periodStart) {
      return NextResponse.json(
        { success: false, error: { message: 'period_end must be after period_start' } },
        { status: 400 }
      )
    }

    // Get user IDs to calculate for
    let userIds: string[]
    if (userIdsStr) {
      userIds = userIdsStr.split(',').map(id => id.trim())
    } else {
      // Get all active users in organization
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('organization_id', currentUser.organization_id)
        .eq('active', true)

      userIds = users?.map(u => u.id) || []
    }

    if (userIds.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'No users to calculate commissions for' } },
        { status: 400 }
      )
    }

    // Calculate commissions for each user
    const results: any[] = []
    const errors: any[] = []

    for (const userId of userIds) {
      try {
        const result = await commissionEngineV2.calculateCommission(
          currentUser.organization_id,
          userId,
          periodStart,
          periodEnd,
          saveCalculations
        )

        results.push({
          user_id: userId,
          calculation: result.calculation,
          steps_count: result.steps.length,
        })
      } catch (error: any) {
        errors.push({
          user_id: userId,
          error: error.message || 'Failed to calculate commission',
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        results,
        errors,
        summary: {
          total_users: userIds.length,
          successful: results.length,
          failed: errors.length,
          total_commission: results.reduce((sum, r) => sum + r.calculation.total_amount, 0),
        },
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/commissions/calculate/batch:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
