// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { ruleConflictDetector } from '@/lib/rule-conflict-detector'
import type { CommissionRule } from '@/types/commission'
import type { Database } from '@/types/database'
import { z } from 'zod'

// =====================================================
// COMMISSION RULES API - List & Create
// Phase 1A: Commission rules management
// =====================================================

// Validation schema for creating rules
const createRuleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  rule_type: z.enum(['percentage', 'flat', 'threshold', 'tiered', 'accelerator', 'bonus']),
  applies_to_role: z.enum(['sales_rep', 'team_lead', 'manager', 'accounts', 'director']).nullable().optional(),
  applies_to_user_ids: z.array(z.string().uuid()).nullable().optional(),
  config: z.record(z.any()), // Validated by rule type
  priority: z.number().int().min(0).max(1000).default(0),
  stacking_behavior: z.enum(['replace', 'add', 'multiply', 'highest']).default('replace'),
  is_absolute: z.boolean().default(false),
  effective_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  effective_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
})

/**
 * GET /api/commission-rules
 * List all commission rules for the user's organization
 *
 * Query params:
 * - active_only: boolean (default: true) - only return active rules
 * - role: string - filter by role
 * - user_id: string - filter by user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // API routes cannot set cookies, but this is required by the interface
          },
          remove(name: string, options: CookieOptions) {
            // API routes cannot remove cookies, but this is required by the interface
          },
        },
      }
    )

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
      .select('organization_id, role')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      )
    }

    // Check permissions - only managers, directors, and accounts can view rules
    if (!['manager', 'director', 'accounts'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: { message: 'Insufficient permissions. Only managers, directors, and accounts can view commission rules.' } },
        { status: 403 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active_only') !== 'false'
    const roleFilter = searchParams.get('role')
    const userIdFilter = searchParams.get('user_id')

    // Build query
    let query = supabase
      .from('commission_rules')
      .select('*')
      .eq('organization_id', user.organization_id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (activeOnly) {
      query = query.eq('active', true)
    }

    if (roleFilter) {
      query = query.eq('applies_to_role', roleFilter)
    }

    if (userIdFilter) {
      query = query.contains('applies_to_user_ids', [userIdFilter])
    }

    const { data: rules, error } = await query

    if (error) {
      console.error('Error fetching commission rules:', error)
      return NextResponse.json(
        { success: false, error: { message: 'Failed to fetch commission rules' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        rules,
        count: rules?.length || 0,
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/commission-rules:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

/**
 * POST /api/commission-rules
 * Create a new commission rule
 *
 * Includes automatic conflict detection before creation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            // API routes cannot set cookies, but this is required by the interface
          },
          remove(name: string, options: CookieOptions) {
            // API routes cannot remove cookies, but this is required by the interface
          },
        },
      }
    )

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
      .select('organization_id, role, name')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      )
    }

    // Check permissions - only managers and directors can create rules
    if (!['manager', 'director'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: { message: 'Insufficient permissions. Only managers and directors can create commission rules.' } },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createRuleSchema.parse(body)

    // Additional validation based on rule type
    const configError = validateRuleConfig(validatedData.rule_type, validatedData.config)
    if (configError) {
      return NextResponse.json(
        { success: false, error: { message: configError } },
        { status: 400 }
      )
    }

    // Check for conflicts
    const conflicts = await ruleConflictDetector.detectConflicts({
      organization_id: user.organization_id,
      name: validatedData.name,
      rule_type: validatedData.rule_type,
      applies_to_role: validatedData.applies_to_role || null,
      applies_to_user_ids: validatedData.applies_to_user_ids || null,
      config: validatedData.config,
      priority: validatedData.priority,
      stacking_behavior: validatedData.stacking_behavior,
      is_absolute: validatedData.is_absolute,
      effective_from: new Date(validatedData.effective_from),
      effective_to: validatedData.effective_to ? new Date(validatedData.effective_to) : null,
      active: true,
    } as any)

    // Check for blocking conflicts
    const blockingConflicts = conflicts.filter(c => c.severity === 'error')
    if (blockingConflicts.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Rule conflicts detected',
            conflicts: blockingConflicts,
          },
        },
        { status: 409 }
      )
    }

    // Create the rule
    const { data: newRule, error: createError } = await supabase
      .from('commission_rules')
      .insert({
        organization_id: user.organization_id,
        name: validatedData.name,
        description: validatedData.description || null,
        rule_type: validatedData.rule_type,
        applies_to_role: validatedData.applies_to_role || null,
        applies_to_user_ids: validatedData.applies_to_user_ids || null,
        config: validatedData.config,
        priority: validatedData.priority,
        stacking_behavior: validatedData.stacking_behavior,
        is_absolute: validatedData.is_absolute,
        effective_from: validatedData.effective_from,
        effective_to: validatedData.effective_to || null,
        active: true,
        created_by: session.user.id,
        updated_by: session.user.id,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating commission rule:', createError)
      return NextResponse.json(
        { success: false, error: { message: 'Failed to create commission rule' } },
        { status: 500 }
      )
    }

    // Create audit log entry in rule history
    await supabase.from('commission_rule_history').insert({
      rule_id: newRule.id,
      organization_id: user.organization_id,
      action: 'created',
      changed_by: session.user.id,
      changed_by_name: user.name,
      changes: {
        action: 'Rule created',
        rule_name: newRule.name,
        rule_type: newRule.rule_type,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          rule: newRule,
          warnings: conflicts.filter(c => c.severity === 'warning'),
        },
      },
      { status: 201 }
    )
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

    console.error('Unexpected error in POST /api/commission-rules:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

/**
 * Validate rule config based on rule type
 */
function validateRuleConfig(ruleType: string, config: any): string | null {
  switch (ruleType) {
    case 'percentage':
      if (typeof config.rate !== 'number' || config.rate < 0 || config.rate > 1) {
        return 'Percentage rate must be between 0 and 1 (e.g., 0.10 for 10%)'
      }
      break

    case 'flat':
      if (typeof config.amount !== 'number' || config.amount < 0) {
        return 'Flat amount must be a positive number (in pence)'
      }
      if (!config.per_unit || !['deal', 'appointment', 'lead', 'demo', 'call'].includes(config.per_unit)) {
        return 'Flat rate must specify per_unit (deal, appointment, lead, demo, or call)'
      }
      break

    case 'threshold':
      if (typeof config.threshold !== 'number' || config.threshold < 0) {
        return 'Threshold must be a positive number (in pence)'
      }
      if (typeof config.rate !== 'number' || config.rate < 0 || config.rate > 1) {
        return 'Threshold rate must be between 0 and 1'
      }
      break

    case 'tiered':
      if (!Array.isArray(config.tiers) || config.tiers.length === 0) {
        return 'Tiered rule must have at least one tier'
      }
      for (const tier of config.tiers) {
        if (typeof tier.min_amount !== 'number' || tier.min_amount < 0) {
          return 'Each tier must have a valid min_amount'
        }
        if (typeof tier.rate !== 'number' || tier.rate < 0 || tier.rate > 1) {
          return 'Each tier must have a rate between 0 and 1'
        }
      }
      break

    case 'accelerator':
      if (typeof config.base_rate !== 'number' || config.base_rate < 0 || config.base_rate > 1) {
        return 'Base rate must be between 0 and 1'
      }
      if (typeof config.accelerated_rate !== 'number' || config.accelerated_rate < 0 || config.accelerated_rate > 1) {
        return 'Accelerated rate must be between 0 and 1'
      }
      if (typeof config.trigger_threshold !== 'number' || config.trigger_threshold < 0) {
        return 'Trigger threshold must be a positive number'
      }
      break

    case 'bonus':
      if (typeof config.bonus_amount !== 'number' || config.bonus_amount < 0) {
        return 'Bonus amount must be a positive number (in pence)'
      }
      if (typeof config.target_amount !== 'number' || config.target_amount < 0) {
        return 'Target amount must be a positive number (in pence)'
      }
      break

    default:
      return `Unknown rule type: ${ruleType}`
  }

  return null
}
