// =====================================================
// COMMISSION SYSTEM TYPES
// Phase 1A: Flexible Commission Rules
// =====================================================

// =====================================================
// RULE TYPES
// =====================================================

export type RuleType =
  | 'percentage'   // Fixed % of profit
  | 'flat'        // Fixed amount per deal/activity
  | 'threshold'   // Must hit target to earn
  | 'tiered'      // Different rates at different levels
  | 'accelerator' // Rate increases after hitting target
  | 'bonus'       // One-time bonus for achievement

export type StackingBehavior =
  | 'replace'   // This rule replaces lower priority rules
  | 'add'       // Add to existing commission
  | 'multiply'  // Multiply existing commission
  | 'highest'   // Use highest between this and others

export type UserRole =
  | 'sales_rep'   // formerly 'telesales'
  | 'team_lead'   // formerly 'bdm'
  | 'manager'
  | 'accounts'
  | 'director'

export type CalculationType =
  | 'deal'      // Single deal commission
  | 'monthly'   // Monthly aggregate
  | 'quarterly'
  | 'annual'
  | 'manual'    // Manual adjustment

export type CalculationStatus =
  | 'calculated'        // Just calculated, not yet submitted
  | 'pending'           // Submitted for approval
  | 'manager_approved'  // Manager approved, awaiting accounts
  | 'accounts_approved' // Accounts approved, ready for payroll
  | 'approved'          // Final approval
  | 'paid'
  | 'rejected'
  | 'disputed'

// =====================================================
// RULE CONFIGURATION TYPES
// =====================================================

export interface PercentageConfig {
  rate: number  // 0.10 = 10%
}

export interface FlatConfig {
  amount: number       // In pence
  per: 'deal' | 'appointment' | 'demo' | 'lead' | 'call' | 'meeting'
  requires_verification?: boolean
}

export interface ThresholdConfig {
  threshold: number              // In pence (e.g., 350000 = £3,500)
  rate: number                   // Commission rate on excess (1.0 = 100%)
  carry_deficit: boolean         // Does deficit carry to next month?
  calculation_base?: string      // What to calculate from: 'initial_profit', 'remaining_profit', 'deal_value'
}

export interface TieredConfig {
  tiers: Array<{
    min: number        // Min amount in pence
    max: number | null // Max amount (null = infinite)
    rate: number       // Rate for this tier
  }>
}

export interface AcceleratorConfig {
  base_rate: number         // Starting rate (e.g., 0.10 = 10%)
  trigger: number           // Trigger amount in pence (e.g., 1000000 = £10k)
  accelerated_rate: number  // New rate after trigger (e.g., 0.15 = 15%)
  measurement: 'monthly_sales' | 'quarterly_sales' | 'annual_sales' | 'deal_count'
}

export interface BonusConfig {
  condition: {
    monthly_sales_above?: number
    quarterly_sales_above?: number
    deal_count_above?: number
    team_target_met?: boolean
  }
  bonus: number  // Bonus amount in pence
  frequency?: 'monthly' | 'quarterly' | 'annual' | 'once'
}

export type RuleConfig =
  | PercentageConfig
  | FlatConfig
  | ThresholdConfig
  | TieredConfig
  | AcceleratorConfig
  | BonusConfig

// =====================================================
// DATABASE MODELS
// =====================================================

export interface CommissionRule {
  id: string
  organization_id: string

  // Rule identification
  name: string
  description: string | null

  // Rule type and configuration
  rule_type: RuleType
  config: RuleConfig

  // Who does this apply to?
  applies_to_role: UserRole | null
  applies_to_user_ids: string[] | null

  // When is this active?
  active: boolean
  effective_from: Date
  effective_to: Date | null

  // Priority and stacking
  priority: number
  stacking_behavior: StackingBehavior
  is_absolute: boolean

  // Metadata
  created_by: string | null
  created_at: Date
  updated_at: Date
}

export interface CommissionCalculation {
  id: string
  organization_id: string

  // What was calculated?
  user_id: string
  rule_id: string | null

  // Time period
  calculation_period_start: Date
  calculation_period_end: Date
  calculation_type: CalculationType

  // Inputs (stored as JSONB)
  input_data: CalculationInputData

  // Outputs (in pence)
  base_amount: number
  bonus_amount: number
  adjustments: number
  total_amount: number

  // Breakdown (for explainer)
  calculation_breakdown: CalculationStep[] | null

  // Status
  status: CalculationStatus

  // Approval tracking
  approved_by_manager: string | null
  approved_by_manager_at: Date | null
  approved_by_accounts: string | null
  approved_by_accounts_at: Date | null
  approved_for_payroll: string | null
  approved_for_payroll_at: Date | null

  // Notes
  notes: string | null
  dispute_reason: string | null

  // Metadata
  calculated_by: string | null
  calculated_at: Date
  created_at: Date
  updated_at: Date
}

export interface CalculationInputData {
  deals?: string[]           // Array of deal IDs
  activities?: {
    appointments?: number
    demos?: number
    leads?: number
    calls?: number
  }
  total_sales?: number       // Total sales amount in pence
  total_profit?: number      // Total profit in pence
  previous_deficit?: number  // Deficit from previous period (for threshold rules)
  [key: string]: any        // Allow custom fields
}

export interface CommissionRuleHistory {
  id: string
  rule_id: string
  organization_id: string

  // What changed?
  changed_by: string | null
  change_type: 'created' | 'updated' | 'deactivated' | 'deleted'
  change_reason: string | null

  // Snapshot
  rule_snapshot: CommissionRule

  // When
  changed_at: Date
}

export interface SalesActivity {
  id: string
  organization_id: string
  user_id: string

  // Activity details
  activity_type: 'appointment' | 'demo' | 'lead' | 'call' | 'meeting' | 'quote' | 'site_visit'
  activity_date: Date

  // Customer info
  customer_name: string | null
  customer_contact: string | null
  notes: string | null
  value_estimate: number | null  // In pence

  // Verification
  verified: boolean
  verified_by: string | null
  verified_at: Date | null
  verification_notes: string | null

  // Conversion tracking
  converted_to_deal_id: string | null
  converted_at: Date | null

  // Metadata
  created_at: Date
  updated_at: Date
}

// =====================================================
// CALCULATION EXPLAINER TYPES
// =====================================================

export interface CalculationStep {
  step: number
  rule_name: string
  rule_id: string
  rule_type: RuleType
  status: 'applied' | 'not_applied' | 'skipped'
  reason?: string              // Why was this rule applied/not applied?
  formula?: string             // Human-readable formula (e.g., "£20,000 × 12%")
  inputs: Record<string, any>  // Input values used in calculation
  result: number               // Result of this step (in pence)
  explanation: string          // Human-readable explanation
  icon?: string                // UI icon (e.g., "✅", "❌", "⏭️")
}

export interface CommissionExplanation {
  calculation_id: string
  user_id: string
  user_name: string
  period_start: Date
  period_end: Date
  final_commission: number  // In pence
  steps: CalculationStep[]
  summary: {
    deals_count?: number
    total_sales?: number
    total_profit?: number
    activities?: Record<string, number>
  }
}

// =====================================================
// DRY RUN / WHAT-IF TYPES
// =====================================================

export interface DryRunRequest {
  // What rules to test?
  proposed_rules: CommissionRule[]

  // What period to simulate?
  period_start: Date
  period_end: Date

  // Optional: Test for specific users
  user_ids?: string[]
}

export interface DryRunResult {
  // Current (production) results
  current_results: {
    total_commission: number
    by_user: Record<string, number>  // user_id → commission amount
  }

  // Proposed (test) results
  proposed_results: {
    total_commission: number
    by_user: Record<string, number>
  }

  // Difference analysis
  difference: {
    total_change: number      // In pence
    total_change_percent: number
    by_user: Record<string, {
      current: number
      proposed: number
      change: number
      change_percent: number
      reason: string
    }>
  }

  // Budget impact
  budget_impact: {
    monthly: number
    quarterly: number
    annual: number
  }

  // Warnings
  warnings: string[]
}

// =====================================================
// RULE CONFLICT DETECTION TYPES
// =====================================================

export type ConflictType =
  | 'same_scope_same_priority'  // Same users, same priority, overlapping dates
  | 'overlapping_dates'         // Rules for same scope with overlapping dates
  | 'stacking_ambiguity'        // Unclear how rules should stack

export type ConflictSeverity = 'error' | 'warning' | 'info'

export interface RuleConflict {
  type: ConflictType
  severity: ConflictSeverity
  conflicting_rule_ids: string[]
  conflicting_rule_names: string[]
  explanation: string
  suggested_fixes: ConflictResolution[]
}

export interface ConflictResolution {
  action: string  // e.g., 'increase_new_rule_priority', 'change_stacking_behavior'
  description: string
  auto_applicable: boolean  // Can this be auto-applied?
  apply_function?: () => CommissionRule  // Function to apply the fix
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface CreateRuleRequest {
  name: string
  description?: string
  rule_type: RuleType
  config: RuleConfig
  applies_to_role?: UserRole
  applies_to_user_ids?: string[]
  effective_from?: Date
  effective_to?: Date
  priority?: number
  stacking_behavior?: StackingBehavior
  is_absolute?: boolean
}

export interface UpdateRuleRequest extends Partial<CreateRuleRequest> {
  change_reason?: string  // Why is this being changed?
}

export interface CalculateCommissionRequest {
  user_id: string
  period_start: Date
  period_end: Date
  calculation_type: CalculationType
}

export interface CalculateCommissionResponse {
  calculation: CommissionCalculation
  explanation: CommissionExplanation
}

// =====================================================
// UTILITY TYPES
// =====================================================

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: any
  }
}

// =====================================================
// HELPER FUNCTIONS (Type Guards)
// =====================================================

export function isPercentageConfig(config: RuleConfig): config is PercentageConfig {
  return 'rate' in config && !('amount' in config) && !('threshold' in config)
}

export function isFlatConfig(config: RuleConfig): config is FlatConfig {
  return 'amount' in config && 'per' in config
}

export function isThresholdConfig(config: RuleConfig): config is ThresholdConfig {
  return 'threshold' in config && 'carry_deficit' in config
}

export function isTieredConfig(config: RuleConfig): config is TieredConfig {
  return 'tiers' in config && Array.isArray((config as any).tiers)
}

export function isAcceleratorConfig(config: RuleConfig): config is AcceleratorConfig {
  return 'base_rate' in config && 'trigger' in config && 'accelerated_rate' in config
}

export function isBonusConfig(config: RuleConfig): config is BonusConfig {
  return 'condition' in config && 'bonus' in config
}
