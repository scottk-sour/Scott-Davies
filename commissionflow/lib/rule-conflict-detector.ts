// @ts-nocheck
// =====================================================
// RULE CONFLICT DETECTOR
// Phase 1A: Detect and resolve commission rule conflicts
// =====================================================

import { createServerClient } from './supabase/client'
import type {
  CommissionRule,
  RuleConflict,
  ConflictType,
  ConflictSeverity,
  ConflictResolution,
} from '@/types/commission'

export class RuleConflictDetector {
  /**
   * Detect conflicts for a new or updated rule
   *
   * @param newRule - The rule being created or updated
   * @param existingRuleId - If updating, the ID of the existing rule (to exclude from conflict check)
   * @returns Array of detected conflicts
   */
  async detectConflicts(
    newRule: Partial<CommissionRule> & { organization_id: string },
    existingRuleId?: string
  ): Promise<RuleConflict[]> {
    const supabase = createServerClient()
    const conflicts: RuleConflict[] = []

    // 1. Get all active rules for this organization (excluding the rule being updated)
    let query = supabase
      .from('commission_rules')
      .select('*')
      .eq('organization_id', newRule.organization_id)
      .eq('active', true)

    if (existingRuleId) {
      query = query.neq('id', existingRuleId)
    }

    const { data: existingRules, error } = await query

    if (error) {
      throw new Error(`Failed to fetch existing rules: ${error.message}`)
    }

    if (!existingRules || existingRules.length === 0) {
      return [] // No conflicts if no existing rules
    }

    // 2. Check for various conflict types
    for (const existingRule of existingRules) {
      // Conflict Type 1: Same scope, same priority, overlapping dates
      const scopeConflict = this.checkScopePriorityConflict(
        newRule,
        existingRule as CommissionRule
      )
      if (scopeConflict) {
        conflicts.push(scopeConflict)
      }

      // Conflict Type 2: Ambiguous stacking behavior
      const stackingConflict = this.checkStackingAmbiguity(
        newRule,
        existingRule as CommissionRule
      )
      if (stackingConflict) {
        conflicts.push(stackingConflict)
      }

      // Conflict Type 3: Absolute rule override attempt
      const absoluteConflict = this.checkAbsoluteRuleConflict(
        newRule,
        existingRule as CommissionRule
      )
      if (absoluteConflict) {
        conflicts.push(absoluteConflict)
      }
    }

    // 3. Deduplicate conflicts (same conflicting rules)
    return this.deduplicateConflicts(conflicts)
  }

  /**
   * Check for same scope + same priority conflict
   */
  private checkScopePriorityConflict(
    newRule: Partial<CommissionRule> & { organization_id: string },
    existingRule: CommissionRule
  ): RuleConflict | null {
    // Check if rules apply to same users
    const sameScope = this.hasSameScope(newRule, existingRule)

    if (!sameScope) {
      return null // Different users, no conflict
    }

    // Check if they have same priority
    const newPriority = newRule.priority ?? 0
    const samePriority = newPriority === existingRule.priority

    if (!samePriority) {
      return null // Different priorities, higher one wins (no conflict)
    }

    // Check if dates overlap
    const datesOverlap = this.checkDateOverlap(
      newRule.effective_from,
      newRule.effective_to,
      existingRule.effective_from,
      existingRule.effective_to
    )

    if (!datesOverlap) {
      return null // No date overlap, no conflict
    }

    // Check if both are same rule type (e.g., both percentage)
    const sameType = newRule.rule_type === existingRule.rule_type

    // CONFLICT DETECTED
    return {
      type: 'same_scope_same_priority',
      severity: 'error',
      conflicting_rule_ids: [existingRule.id],
      conflicting_rule_names: [existingRule.name],
      explanation: sameType
        ? `Both rules apply to the same users with the same priority (${newPriority}) and rule type (${newRule.rule_type}). The system won't know which one to use.`
        : `Both rules apply to the same users with the same priority (${newPriority}). Without clear precedence, calculation results may be unpredictable.`,
      suggested_fixes: this.getScopePriorityFixes(newRule, existingRule),
    }
  }

  /**
   * Check for stacking ambiguity
   */
  private checkStackingAmbiguity(
    newRule: Partial<CommissionRule> & { organization_id: string },
    existingRule: CommissionRule
  ): RuleConflict | null {
    // Check if new rule applies to both role AND specific users
    if (newRule.applies_to_role && newRule.applies_to_user_ids && newRule.applies_to_user_ids.length > 0) {
      return {
        type: 'stacking_ambiguity',
        severity: 'warning',
        conflicting_rule_ids: [],
        conflicting_rule_names: [],
        explanation: `Rule applies to both a role (${newRule.applies_to_role}) AND specific users. This can create confusion about whether the rule applies twice.`,
        suggested_fixes: [
          {
            action: 'split_into_two_rules',
            description: 'Create separate rules for role and individuals',
            auto_applicable: false,
          },
          {
            action: 'remove_role_scope',
            description: 'Apply only to specific users (remove role)',
            auto_applicable: true,
          },
          {
            action: 'remove_user_scope',
            description: 'Apply only to role (remove specific users)',
            auto_applicable: true,
          },
        ],
      }
    }

    // Check if stacking behavior is unclear with existing rules
    const sameScope = this.hasSameScope(newRule, existingRule)
    if (!sameScope) {
      return null
    }

    const stackingBehavior = newRule.stacking_behavior || 'replace'
    if (stackingBehavior === 'replace' && existingRule.stacking_behavior === 'replace') {
      // Both want to replace - which one wins?
      const newPriority = newRule.priority ?? 0
      if (newPriority === existingRule.priority) {
        return {
          type: 'stacking_ambiguity',
          severity: 'warning',
          conflicting_rule_ids: [existingRule.id],
          conflicting_rule_names: [existingRule.name],
          explanation: `Both rules use "replace" stacking with same priority. Only one will be used, but which one is undefined.`,
          suggested_fixes: [
            {
              action: 'increase_new_rule_priority',
              description: 'Give new rule higher priority to ensure it wins',
              auto_applicable: true,
            },
            {
              action: 'change_to_add_stacking',
              description: 'Change new rule to "add" so both apply',
              auto_applicable: true,
            },
          ],
        }
      }
    }

    return null
  }

  /**
   * Check if trying to override an absolute rule
   */
  private checkAbsoluteRuleConflict(
    newRule: Partial<CommissionRule> & { organization_id: string },
    existingRule: CommissionRule
  ): RuleConflict | null {
    if (!existingRule.is_absolute) {
      return null // Existing rule is not absolute, can be overridden
    }

    const sameScope = this.hasSameScope(newRule, existingRule)
    if (!sameScope) {
      return null // Different scope, no conflict
    }

    const datesOverlap = this.checkDateOverlap(
      newRule.effective_from,
      newRule.effective_to,
      existingRule.effective_from,
      existingRule.effective_to
    )

    if (!datesOverlap) {
      return null // No date overlap
    }

    // CONFLICT: Trying to override an absolute rule
    return {
      type: 'same_scope_same_priority',
      severity: 'error',
      conflicting_rule_ids: [existingRule.id],
      conflicting_rule_names: [existingRule.name],
      explanation: `Cannot override "${existingRule.name}" because it is marked as absolute. This rule takes precedence over all others.`,
      suggested_fixes: [
        {
          action: 'apply_to_different_users',
          description: 'Apply new rule to different users/role',
          auto_applicable: false,
        },
        {
          action: 'change_effective_dates',
          description: 'Set new rule to start after absolute rule ends',
          auto_applicable: existingRule.effective_to !== null,
        },
        {
          action: 'deactivate_absolute_rule',
          description: `Deactivate "${existingRule.name}" first (requires manager approval)`,
          auto_applicable: false,
        },
      ],
    }
  }

  /**
   * Check if two rules apply to the same users
   */
  private hasSameScope(
    rule1: Partial<CommissionRule>,
    rule2: CommissionRule
  ): boolean {
    // Case 1: Both apply to same role
    if (rule1.applies_to_role && rule1.applies_to_role === rule2.applies_to_role) {
      return true
    }

    // Case 2: Both apply to specific overlapping users
    if (rule1.applies_to_user_ids && rule2.applies_to_user_ids) {
      const rule1Users = new Set(rule1.applies_to_user_ids)
      const overlap = rule2.applies_to_user_ids.some(userId => rule1Users.has(userId))
      if (overlap) {
        return true
      }
    }

    // Case 3: Rule 1 applies to role, Rule 2 applies to users in that role
    // (This is complex to check without user data, so we'll return false for now)
    // TODO: Enhance with user role lookup if needed

    return false
  }

  /**
   * Check if date ranges overlap
   */
  private checkDateOverlap(
    start1: Date | string | undefined | null,
    end1: Date | string | undefined | null,
    start2: Date | string | undefined | null,
    end2: Date | string | undefined | null
  ): boolean {
    // Convert to Date objects
    const s1 = start1 ? new Date(start1) : new Date('1900-01-01')
    const e1 = end1 ? new Date(end1) : new Date('2099-12-31')
    const s2 = start2 ? new Date(start2) : new Date('1900-01-01')
    const e2 = end2 ? new Date(end2) : new Date('2099-12-31')

    // Check overlap: ranges overlap if start1 <= end2 AND start2 <= end1
    return s1 <= e2 && s2 <= e1
  }

  /**
   * Get suggested fixes for scope/priority conflicts
   */
  private getScopePriorityFixes(
    newRule: Partial<CommissionRule>,
    existingRule: CommissionRule
  ): ConflictResolution[] {
    const fixes: ConflictResolution[] = []

    // Fix 1: Increase new rule priority
    fixes.push({
      action: 'increase_new_rule_priority',
      description: `Set new rule priority to ${existingRule.priority + 10} (higher than "${existingRule.name}")`,
      auto_applicable: true,
      apply_function: () => ({
        ...newRule,
        priority: existingRule.priority + 10,
      } as CommissionRule),
    })

    // Fix 2: Change stacking behavior to "add"
    if (newRule.rule_type === 'percentage' || newRule.rule_type === 'flat' || newRule.rule_type === 'bonus') {
      fixes.push({
        action: 'change_stacking_to_add',
        description: 'Make new rule ADD to existing (both rules apply)',
        auto_applicable: true,
        apply_function: () => ({
          ...newRule,
          stacking_behavior: 'add',
        } as CommissionRule),
      })
    }

    // Fix 3: Adjust effective dates
    if (existingRule.effective_to) {
      fixes.push({
        action: 'start_after_existing_ends',
        description: `Set new rule to start after "${existingRule.name}" ends`,
        auto_applicable: true,
        apply_function: () => {
          const nextDay = new Date(existingRule.effective_to!)
          nextDay.setDate(nextDay.getDate() + 1)
          return {
            ...newRule,
            effective_from: nextDay,
          } as CommissionRule
        },
      })
    }

    // Fix 4: Deactivate existing rule
    fixes.push({
      action: 'deactivate_existing_rule',
      description: `Deactivate "${existingRule.name}" and use new rule`,
      auto_applicable: false, // Requires user confirmation
    })

    return fixes
  }

  /**
   * Deduplicate conflicts (merge conflicts for same rules)
   */
  private deduplicateConflicts(conflicts: RuleConflict[]): RuleConflict[] {
    const seen = new Map<string, RuleConflict>()

    for (const conflict of conflicts) {
      const key = conflict.conflicting_rule_ids.sort().join(',')

      if (seen.has(key)) {
        // Merge with existing conflict (keep highest severity)
        const existing = seen.get(key)!
        if (this.getSeverityLevel(conflict.severity) > this.getSeverityLevel(existing.severity)) {
          seen.set(key, conflict)
        }
      } else {
        seen.set(key, conflict)
      }
    }

    return Array.from(seen.values())
  }

  /**
   * Get numeric severity level for comparison
   */
  private getSeverityLevel(severity: ConflictSeverity): number {
    switch (severity) {
      case 'error':
        return 3
      case 'warning':
        return 2
      case 'info':
        return 1
      default:
        return 0
    }
  }

  /**
   * Apply a suggested fix
   */
  applyFix(
    rule: Partial<CommissionRule>,
    fix: ConflictResolution
  ): Partial<CommissionRule> {
    if (fix.apply_function) {
      return fix.apply_function()
    }

    // Manual fixes that require user interaction
    return rule
  }

  /**
   * Check if conflicts block saving
   */
  hasBlockingConflicts(conflicts: RuleConflict[]): boolean {
    return conflicts.some(c => c.severity === 'error')
  }

  /**
   * Get conflict summary for UI display
   */
  getConflictSummary(conflicts: RuleConflict[]): {
    total: number
    errors: number
    warnings: number
    infos: number
    blocking: boolean
  } {
    return {
      total: conflicts.length,
      errors: conflicts.filter(c => c.severity === 'error').length,
      warnings: conflicts.filter(c => c.severity === 'warning').length,
      infos: conflicts.filter(c => c.severity === 'info').length,
      blocking: this.hasBlockingConflicts(conflicts),
    }
  }
}

// Export singleton instance
export const ruleConflictDetector = new RuleConflictDetector()
