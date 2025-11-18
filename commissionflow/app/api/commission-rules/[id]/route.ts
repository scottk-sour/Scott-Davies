// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { ruleConflictDetector } from '@/lib/rule-conflict-detector'
import { z } from 'zod'

// =====================================================
// COMMISSION RULES API - Individual Rule Operations
// Phase 1A: Get, update, and deactivate specific rules
// =====================================================

// Validation schema for updating rules
const updateRuleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  config: z.record(z.any()).optional(),
  priority: z.number().int().min(0).max(1000).optional(),
  stacking_behavior: z.enum(['replace', 'add', 'multiply', 'highest']).optional(),
  is_absolute: z.boolean().optional(),
  effective_from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  effective_to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  active: z.boolean().optional(),
})

/**
 * GET /api/commission-rules/[id]
 * Get a specific commission rule by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .select('organization_id, role')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      )
    }

    // Check permissions
    if (!['manager', 'director', 'accounts'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: { message: 'Insufficient permissions' } },
        { status: 403 }
      )
    }

    // Fetch the rule
    const { data: rule, error } = await supabase
      .from('commission_rules')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', user.organization_id) // Ensure user can only access their org's rules
      .single()

    if (error || !rule) {
      return NextResponse.json(
        { success: false, error: { message: 'Rule not found' } },
        { status: 404 }
      )
    }

    // Get rule history
    const { data: history } = await supabase
      .from('commission_rule_history')
      .select('*')
      .eq('rule_id', params.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      data: {
        rule,
        history: history || [],
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/commission-rules/[id]:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/commission-rules/[id]
 * Update a specific commission rule
 *
 * Includes conflict detection for changes
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .select('organization_id, role, name')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      )
    }

    // Check permissions - only managers and directors can update rules
    if (!['manager', 'director'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: { message: 'Insufficient permissions. Only managers and directors can update commission rules.' } },
        { status: 403 }
      )
    }

    // Get existing rule
    const { data: existingRule, error: fetchError } = await supabase
      .from('commission_rules')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', user.organization_id)
      .single()

    if (fetchError || !existingRule) {
      return NextResponse.json(
        { success: false, error: { message: 'Rule not found' } },
        { status: 404 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateRuleSchema.parse(body)

    // If config is being updated, validate it
    if (validatedData.config) {
      const configError = validateRuleConfig(existingRule.rule_type, validatedData.config)
      if (configError) {
        return NextResponse.json(
          { success: false, error: { message: configError } },
          { status: 400 }
        )
      }
    }

    // Build updated rule for conflict detection
    const updatedRuleForCheck = {
      ...existingRule,
      ...validatedData,
      organization_id: user.organization_id,
    }

    // Check for conflicts (if significant fields changed)
    const significantFieldsChanged =
      validatedData.priority !== undefined ||
      validatedData.stacking_behavior !== undefined ||
      validatedData.is_absolute !== undefined ||
      validatedData.effective_from !== undefined ||
      validatedData.effective_to !== undefined

    let conflicts: any[] = []
    if (significantFieldsChanged) {
      conflicts = await ruleConflictDetector.detectConflicts(updatedRuleForCheck as any, params.id)

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
    }

    // Track what changed for audit log
    const changes: Record<string, any> = {}
    for (const [key, value] of Object.entries(validatedData)) {
      if (JSON.stringify(existingRule[key as keyof typeof existingRule]) !== JSON.stringify(value)) {
        changes[key] = {
          from: existingRule[key as keyof typeof existingRule],
          to: value,
        }
      }
    }

    // Update the rule
    const { data: updatedRule, error: updateError } = await supabase
      .from('commission_rules')
      .update({
        ...validatedData,
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating commission rule:', updateError)
      return NextResponse.json(
        { success: false, error: { message: 'Failed to update commission rule' } },
        { status: 500 }
      )
    }

    // Create audit log entry
    await supabase.from('commission_rule_history').insert({
      rule_id: params.id,
      organization_id: user.organization_id,
      action: 'updated',
      changed_by: session.user.id,
      changed_by_name: user.name,
      changes: {
        action: 'Rule updated',
        rule_name: updatedRule.name,
        fields_changed: Object.keys(changes),
        changes,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        rule: updatedRule,
        warnings: conflicts.filter(c => c.severity === 'warning'),
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

    console.error('Unexpected error in PATCH /api/commission-rules/[id]:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/commission-rules/[id]
 * Deactivate a commission rule (soft delete)
 *
 * Note: We don't hard delete rules to maintain audit trail
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .select('organization_id, role, name')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      )
    }

    // Check permissions - only managers and directors can delete rules
    if (!['manager', 'director'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: { message: 'Insufficient permissions. Only managers and directors can delete commission rules.' } },
        { status: 403 }
      )
    }

    // Get existing rule
    const { data: existingRule, error: fetchError } = await supabase
      .from('commission_rules')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', user.organization_id)
      .single()

    if (fetchError || !existingRule) {
      return NextResponse.json(
        { success: false, error: { message: 'Rule not found' } },
        { status: 404 }
      )
    }

    // Soft delete by setting active = false
    const { data: deletedRule, error: deleteError } = await supabase
      .from('commission_rules')
      .update({
        active: false,
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (deleteError) {
      console.error('Error deleting commission rule:', deleteError)
      return NextResponse.json(
        { success: false, error: { message: 'Failed to delete commission rule' } },
        { status: 500 }
      )
    }

    // Create audit log entry
    await supabase.from('commission_rule_history').insert({
      rule_id: params.id,
      organization_id: user.organization_id,
      action: 'deactivated',
      changed_by: session.user.id,
      changed_by_name: user.name,
      changes: {
        action: 'Rule deactivated',
        rule_name: existingRule.name,
        reason: 'User requested deletion',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        rule: deletedRule,
        message: 'Rule deactivated successfully',
      },
    })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/commission-rules/[id]:', error)
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
