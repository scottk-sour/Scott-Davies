# CommissionFlow Phase 1 Refactor - Architecture Plan

## Current System Analysis

### Existing Commission Logic (Hardcoded)

**Telesales Commission:**
- **Rate**: 10% (stored in `users.commission_rate`, default 0.10)
- **Calculation**: At deal creation time, stored on deal as `telesales_commission`
- **Formula**: `initial_profit × commission_rate`
- **Limitation**: Cannot vary by deal type, product, performance tier, or time period

**BDM Commission:**
- **Model**: Deficit/threshold model
- **Threshold**: £3,500/month (350,000 pence, configurable per org in `organizations.bdm_threshold_amount`)
- **Rate**: 100% of excess over threshold (configurable in `organizations.bdm_commission_rate`)
- **Logic**:
  1. Calculate monthly profit from all paid deals
  2. Add any deficit from previous month
  3. If total >= threshold: commission = excess × rate, deficit cleared
  4. If total < threshold: no commission, deficit increases
- **Limitation**: Only supports one commission model (deficit), cannot support percentage, tiered, or bonus structures

### Current Database Schema

**Key Tables:**
- `organizations` - Multi-tenant isolation, org-level commission settings
- `users` - Has `role` (admin, manager, telesales, bdm) and `commission_rate` field
- `deals` - Stores calculated commission fields: `initial_profit`, `telesales_commission`, `remaining_profit`
- `commission_records` - Monthly BDM calculations with deficit tracking

**Key Issues:**
1. Commission rules are hardcoded in application logic
2. Commission rates stored per-user, not per-rule
3. No support for multiple rules per user
4. No rule versioning or history
5. No approval workflow tracking
6. Basic RLS but no granular RBAC

---

## Phase 1 Goals

Transform CommissionFlow from an MVP with hardcoded rules into a flexible, production-ready multi-tenant SaaS that supports:

1. **Flexible Commission Rules Engine** - Database-driven commission rules configurable per organization
2. **Role-Based Access Control (RBAC)** - 5 user roles with granular permissions
3. **Sales Rep Self-Service Portal** - View own deals and commission statements
4. **Approval Workflow** - Manager → Accounts → Payroll approval pipeline

---

## New Database Schema Design

### 1. Commission Rules System

#### `commission_rule_types` (Reference Table - Optional)
```sql
CREATE TABLE commission_rule_types (
  type TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  requires_config JSONB -- JSON schema for config validation
);

-- Seed data
INSERT INTO commission_rule_types (type, name, description) VALUES
  ('percentage', 'Percentage', 'Fixed percentage of profit'),
  ('flat', 'Flat Amount', 'Fixed amount per deal'),
  ('threshold', 'Threshold/Deficit', 'Minimum threshold with carryover'),
  ('tiered', 'Tiered', 'Different rates at different levels'),
  ('bonus', 'Bonus', 'One-time bonus on achievement');
```

#### `commission_rules` (Main Rules Table)
```sql
CREATE TABLE commission_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Rule identification
  name TEXT NOT NULL, -- e.g., "Standard Telesales 10%", "BDM £3.5k Threshold"
  description TEXT,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('percentage', 'flat', 'threshold', 'tiered', 'bonus')),

  -- Who does this rule apply to?
  applies_to_role TEXT CHECK (applies_to_role IN ('telesales', 'bdm', 'team_lead')), -- NULL = specific users
  applies_to_user_ids UUID[], -- Specific users (if not role-based)

  -- When is this rule active?
  active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE, -- NULL = ongoing

  -- Rule configuration (flexible JSON structure)
  config JSONB NOT NULL,
  -- Examples:
  -- Percentage: {"rate": 0.10} (10%)
  -- Flat: {"amount": 50000} (£500 per deal)
  -- Threshold: {"threshold": 350000, "rate": 1.0, "carry_deficit": true}
  -- Tiered: {"tiers": [{"min": 0, "max": 500000, "rate": 0.08}, {"min": 500000, "max": null, "rate": 0.12}]}
  -- Bonus: {"target": 1000000, "bonus": 100000, "frequency": "monthly"}

  -- Priority (if multiple rules apply, higher priority wins)
  priority INTEGER DEFAULT 0,

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_rule_name UNIQUE(organization_id, name)
);

CREATE INDEX idx_commission_rules_org ON commission_rules(organization_id);
CREATE INDEX idx_commission_rules_role ON commission_rules(applies_to_role);
CREATE INDEX idx_commission_rules_active ON commission_rules(active);
CREATE INDEX idx_commission_rules_effective ON commission_rules(effective_from, effective_to);
```

#### `commission_calculations` (Replaces Old Approach)
Instead of storing commission amounts on deals, we'll calculate on-demand and cache results:

```sql
CREATE TABLE commission_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- What was calculated?
  user_id UUID NOT NULL REFERENCES users(id),
  rule_id UUID NOT NULL REFERENCES commission_rules(id),

  -- Time period
  calculation_period_start DATE NOT NULL,
  calculation_period_end DATE NOT NULL,
  calculation_type TEXT NOT NULL CHECK (calculation_type IN ('deal', 'monthly', 'quarterly', 'annual')),

  -- Calculation inputs (stored for audit)
  input_data JSONB NOT NULL, -- Deals, metrics, etc.

  -- Calculation outputs
  base_amount INTEGER NOT NULL, -- in pence
  bonus_amount INTEGER DEFAULT 0,
  adjustments INTEGER DEFAULT 0, -- Manual adjustments
  total_amount INTEGER NOT NULL,

  -- State tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'calculated', 'approved', 'paid', 'disputed')),

  -- Approval tracking (for workflow)
  approved_by_manager UUID REFERENCES users(id),
  approved_by_manager_at TIMESTAMP WITH TIME ZONE,
  approved_by_accounts UUID REFERENCES users(id),
  approved_by_accounts_at TIMESTAMP WITH TIME ZONE,
  approved_for_payroll UUID REFERENCES users(id),
  approved_for_payroll_at TIMESTAMP WITH TIME ZONE,

  -- Notes
  notes TEXT,
  dispute_reason TEXT,

  -- Metadata
  calculated_by UUID REFERENCES users(id),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, user_id, rule_id, calculation_period_start, calculation_period_end)
);

CREATE INDEX idx_commission_calculations_org ON commission_calculations(organization_id);
CREATE INDEX idx_commission_calculations_user ON commission_calculations(user_id);
CREATE INDEX idx_commission_calculations_rule ON commission_calculations(rule_id);
CREATE INDEX idx_commission_calculations_period ON commission_calculations(calculation_period_start, calculation_period_end);
CREATE INDEX idx_commission_calculations_status ON commission_calculations(status);
```

#### `commission_rule_history` (Audit Trail)
```sql
CREATE TABLE commission_rule_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES commission_rules(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- What changed?
  changed_by UUID REFERENCES users(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('created', 'updated', 'deactivated', 'deleted')),

  -- Snapshot of rule at this point in time
  rule_snapshot JSONB NOT NULL,

  -- When
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_commission_rule_history_rule ON commission_rule_history(rule_id);
CREATE INDEX idx_commission_rule_history_org ON commission_rule_history(organization_id);
```

---

### 2. Enhanced RBAC System

#### Expand `users.role` Column
```sql
-- Modify existing users table
ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('sales_rep', 'team_lead', 'manager', 'accounts', 'director'));

-- Migration notes:
-- 'telesales' → 'sales_rep'
-- 'bdm' → 'team_lead'
-- 'admin' → 'director' (keep 'manager' for middle management)
```

#### `user_permissions` (Granular Permissions)
```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Permission
  permission TEXT NOT NULL,
  -- Examples:
  -- 'deals.view.all', 'deals.view.own', 'deals.view.team'
  -- 'deals.create', 'deals.edit', 'deals.delete'
  -- 'commissions.view.own', 'commissions.view.all', 'commissions.approve'
  -- 'rules.create', 'rules.edit', 'rules.delete'
  -- 'reports.view', 'reports.export'
  -- 'users.manage'

  -- Grant/revoke
  granted BOOLEAN DEFAULT true,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, user_id, permission)
);

CREATE INDEX idx_user_permissions_org ON user_permissions(organization_id);
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission ON user_permissions(permission);
```

#### Default Role Permissions (Application Logic)
```typescript
// lib/rbac/permissions.ts
export const DEFAULT_PERMISSIONS = {
  sales_rep: [
    'deals.view.own',
    'deals.create',
    'deals.edit.own',
    'commissions.view.own',
  ],
  team_lead: [
    'deals.view.team', // See team members' deals
    'deals.create',
    'deals.edit.own',
    'deals.edit.team',
    'commissions.view.own',
    'commissions.view.team',
  ],
  manager: [
    'deals.view.all',
    'deals.create',
    'deals.edit.all',
    'deals.delete',
    'commissions.view.all',
    'commissions.approve.manager', // First approval level
    'reports.view',
    'reports.export',
  ],
  accounts: [
    'deals.view.all',
    'commissions.view.all',
    'commissions.approve.accounts', // Second approval level
    'reports.view',
    'reports.export',
  ],
  director: [
    'deals.view.all',
    'deals.create',
    'deals.edit.all',
    'deals.delete',
    'commissions.view.all',
    'commissions.approve.all',
    'rules.create',
    'rules.edit',
    'rules.delete',
    'reports.view',
    'reports.export',
    'users.manage',
    'settings.manage',
  ],
}
```

---

### 3. Approval Workflow System

#### `approval_workflows` (Workflow Definitions)
```sql
CREATE TABLE approval_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Workflow definition
  name TEXT NOT NULL, -- e.g., "Standard Commission Approval"
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('commission', 'deal', 'adjustment')),

  -- Approval stages (ordered JSON array)
  stages JSONB NOT NULL,
  -- Example:
  -- [
  --   {"stage": 1, "role": "manager", "required": true},
  --   {"stage": 2, "role": "accounts", "required": true},
  --   {"stage": 3, "role": "director", "required": false}
  -- ]

  -- Auto-approve conditions (optional)
  auto_approve_if JSONB,
  -- Example: {"amount_under": 10000} (auto-approve if under £100)

  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_approval_workflows_org ON approval_workflows(organization_id);
CREATE INDEX idx_approval_workflows_type ON approval_workflows(workflow_type);
```

#### `approval_requests` (Workflow Instances)
```sql
CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES approval_workflows(id),

  -- What needs approval?
  entity_type TEXT NOT NULL, -- 'commission', 'deal', 'adjustment'
  entity_id UUID NOT NULL, -- ID of the thing being approved

  -- Requester
  requested_by UUID NOT NULL REFERENCES users(id),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Current state
  current_stage INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),

  -- Result
  final_approver UUID REFERENCES users(id),
  final_decision_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_approval_requests_org ON approval_requests(organization_id);
CREATE INDEX idx_approval_requests_entity ON approval_requests(entity_type, entity_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_requested_by ON approval_requests(requested_by);
```

#### `approval_actions` (Approval History)
```sql
CREATE TABLE approval_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  approval_request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,

  -- Who acted?
  actor_id UUID NOT NULL REFERENCES users(id),
  actor_role TEXT NOT NULL,

  -- What action?
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected', 'requested_changes')),
  stage INTEGER NOT NULL,

  -- Comments
  comment TEXT,

  -- When
  acted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_approval_actions_request ON approval_actions(approval_request_id);
CREATE INDEX idx_approval_actions_actor ON approval_actions(actor_id);
```

---

### 4. Enhanced Deals Schema

#### Modify `deals` Table
We need to REMOVE the calculated commission fields and calculate on-demand instead:

```sql
-- Phase 1: Add new fields
ALTER TABLE deals ADD COLUMN approval_status TEXT DEFAULT 'draft'
  CHECK (approval_status IN ('draft', 'pending_approval', 'approved', 'rejected'));
ALTER TABLE deals ADD COLUMN approved_by UUID REFERENCES users(id);
ALTER TABLE deals ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

-- Phase 2: Mark old commission fields as deprecated (don't drop yet - migration)
ALTER TABLE deals RENAME COLUMN telesales_commission TO telesales_commission_legacy;
ALTER TABLE deals RENAME COLUMN remaining_profit TO remaining_profit_legacy;

-- Add comment for future removal
COMMENT ON COLUMN deals.telesales_commission_legacy IS 'DEPRECATED: Use commission_calculations table instead';
COMMENT ON COLUMN deals.remaining_profit_legacy IS 'DEPRECATED: Use commission_calculations table instead';
```

---

## Migration Strategy

### Phase 1A: Add New Tables (Non-Breaking)
1. Create all new tables: `commission_rules`, `commission_calculations`, `commission_rule_history`
2. Create RBAC tables: `user_permissions`
3. Create workflow tables: `approval_workflows`, `approval_requests`, `approval_actions`
4. Deploy schema changes - **existing app still works**

### Phase 1B: Seed Default Rules (Migration Script)
```typescript
// scripts/migrate-to-flexible-rules.ts
async function migrateExistingRules() {
  const orgs = await prisma.organizations.findMany()

  for (const org of orgs) {
    // 1. Create default telesales rule (10%)
    await prisma.commission_rules.create({
      data: {
        organization_id: org.id,
        name: 'Standard Telesales Commission',
        rule_type: 'percentage',
        applies_to_role: 'sales_rep', // was 'telesales'
        active: true,
        config: { rate: 0.10 }, // 10%
        priority: 0,
      }
    })

    // 2. Create default BDM rule (threshold)
    await prisma.commission_rules.create({
      data: {
        organization_id: org.id,
        name: 'BDM Threshold Commission',
        rule_type: 'threshold',
        applies_to_role: 'team_lead', // was 'bdm'
        active: true,
        config: {
          threshold: org.bdm_threshold_amount || 350000,
          rate: org.bdm_commission_rate || 1.0,
          carry_deficit: true,
        },
        priority: 0,
      }
    })
  }
}
```

### Phase 1C: Update Application Code
1. **New Commission Calculator**: Create `lib/commission-engine.ts` that reads rules from database
2. **Backward Compatibility**: Keep old calculator working for existing deals
3. **Dual-Write Period**: Save commissions to both old fields AND new `commission_calculations` table
4. **Feature Flag**: Add `USE_FLEXIBLE_RULES` flag per organization

### Phase 1D: Migrate User Roles
```typescript
async function migrateUserRoles() {
  // telesales → sales_rep
  await prisma.$executeRaw`
    UPDATE users SET role = 'sales_rep' WHERE role = 'telesales'
  `

  // bdm → team_lead
  await prisma.$executeRaw`
    UPDATE users SET role = 'team_lead' WHERE role = 'bdm'
  `

  // admin → director
  await prisma.$executeRaw`
    UPDATE users SET role = 'director' WHERE role = 'admin'
  `
}
```

### Phase 1E: Gradual Rollout
1. **Week 1-2**: Deploy schema, test in staging
2. **Week 3**: Enable for 1-2 pilot organizations
3. **Week 4**: Monitor, fix bugs
4. **Week 5+**: Roll out to all organizations
5. **Month 2**: Remove old fields (after all data migrated)

---

## New Commission Calculation Engine

### `lib/commission-engine.ts`
```typescript
export class CommissionEngine {
  /**
   * Calculate commission for a user based on active rules
   */
  async calculateCommission(
    organizationId: string,
    userId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<CommissionCalculation[]> {
    // 1. Get all active rules for this user
    const rules = await this.getApplicableRules(organizationId, userId)

    // 2. Get relevant deals in period
    const deals = await this.getDealsInPeriod(organizationId, userId, periodStart, periodEnd)

    // 3. Calculate for each rule
    const calculations = []
    for (const rule of rules) {
      const calc = await this.applyRule(rule, deals, periodStart, periodEnd)
      calculations.push(calc)
    }

    return calculations
  }

  /**
   * Apply a specific rule to deals
   */
  private async applyRule(
    rule: CommissionRule,
    deals: Deal[],
    periodStart: Date,
    periodEnd: Date
  ): Promise<CommissionCalculation> {
    switch (rule.rule_type) {
      case 'percentage':
        return this.calculatePercentage(rule, deals)

      case 'flat':
        return this.calculateFlat(rule, deals)

      case 'threshold':
        return this.calculateThreshold(rule, deals, periodStart)

      case 'tiered':
        return this.calculateTiered(rule, deals)

      case 'bonus':
        return this.calculateBonus(rule, deals)

      default:
        throw new Error(`Unknown rule type: ${rule.rule_type}`)
    }
  }

  private calculatePercentage(rule: CommissionRule, deals: Deal[]) {
    const rate = rule.config.rate as number
    const totalProfit = deals.reduce((sum, d) => sum + d.initial_profit, 0)
    const commission = Math.round(totalProfit * rate)

    return {
      base_amount: commission,
      total_amount: commission,
      input_data: { deals: deals.map(d => d.id), rate },
    }
  }

  private calculateThreshold(rule: CommissionRule, deals: Deal[], periodStart: Date) {
    const config = rule.config as { threshold: number; rate: number; carry_deficit: boolean }
    const totalProfit = deals.reduce((sum, d) => sum + d.remaining_profit_legacy, 0)

    // Get previous deficit
    const previousDeficit = await this.getPreviousDeficit(...)

    const thresholdNeeded = config.threshold + previousDeficit
    const thresholdMet = totalProfit >= thresholdNeeded

    let commission = 0
    let deficitToNext = 0

    if (thresholdMet) {
      const excess = totalProfit - thresholdNeeded
      commission = Math.round(excess * config.rate)
      deficitToNext = 0
    } else {
      deficitToNext = thresholdNeeded - totalProfit
    }

    return {
      base_amount: commission,
      total_amount: commission,
      input_data: {
        deals: deals.map(d => d.id),
        totalProfit,
        previousDeficit,
        thresholdNeeded,
        thresholdMet,
        deficitToNext,
      },
    }
  }

  // Additional calculation methods...
}
```

---

## API Changes

### New API Routes

#### Commission Rules Management
```typescript
// GET /api/commission-rules - List rules for organization
// POST /api/commission-rules - Create new rule
// PATCH /api/commission-rules/[id] - Update rule
// DELETE /api/commission-rules/[id] - Deactivate rule

// POST /api/commission-rules/[id]/clone - Clone rule with new dates
```

#### Commission Calculations
```typescript
// GET /api/commissions/calculate - Calculate commissions for period
//   ?userId=xxx&start=2025-01-01&end=2025-01-31
// POST /api/commissions/save - Save calculation
// GET /api/commissions/[userId]/history - Get user's commission history
// GET /api/commissions/pending-approval - Get commissions pending approval
```

#### Approval Workflow
```typescript
// GET /api/approvals - Get approval requests (filtered by role)
// POST /api/approvals/[id]/approve - Approve request
// POST /api/approvals/[id]/reject - Reject request
// POST /api/approvals/[id]/comment - Add comment
```

---

## UI Changes

### 1. Settings → Commission Rules Page
New page for directors/managers to configure rules:
- List all rules (with active/inactive filter)
- Create new rule form with rule type selector
- Edit existing rules
- View rule history/audit trail
- Clone rules (for seasonal changes)

### 2. Dashboard → Commission Calculator
Replace hardcoded calculation with:
- "Calculate Commissions" button
- Period selector (month/quarter/year)
- Shows breakdown by rule
- Export to CSV
- Submit for approval button

### 3. Approvals Dashboard
New page for managers/accounts:
- List of pending approvals (by stage)
- Approve/reject actions
- Comment system
- Filter by user, amount, date range

### 4. Sales Rep Portal
New view for sales reps:
- "My Deals" - only their deals
- "My Commissions" - their commission statements
- Cannot see others' data
- Simple, clean interface

---

## Testing Strategy

### Unit Tests
- Commission calculation for each rule type
- RBAC permission checks
- Approval workflow state transitions

### Integration Tests
- End-to-end commission calculation flow
- Approval workflow from submission to final approval
- Role-based access control

### Migration Tests
- Test migration scripts on copy of production data
- Verify old and new calculations match
- Test rollback procedures

---

## Rollout Checklist

- [ ] Create new database schema
- [ ] Write migration scripts
- [ ] Build new CommissionEngine
- [ ] Add backward compatibility layer
- [ ] Build Commission Rules UI
- [ ] Build Approval Workflow UI
- [ ] Build Sales Rep Portal
- [ ] Update RBAC and permissions
- [ ] Write comprehensive tests
- [ ] Deploy to staging
- [ ] Test with pilot organization
- [ ] Monitor for 2 weeks
- [ ] Roll out to all organizations
- [ ] Deprecate old fields after 1 month

---

## Timeline Estimate

**Phase 1A - Schema & Backend**: 1-2 weeks
- Database schema changes
- Migration scripts
- New CommissionEngine

**Phase 1B - UI**: 2-3 weeks
- Commission rules management
- Approval workflow dashboard
- Sales rep portal

**Phase 1C - Testing & Rollout**: 2 weeks
- Comprehensive testing
- Pilot organization
- Gradual rollout

**Total**: 5-7 weeks for Phase 1

---

## Success Metrics

- Organizations can create custom commission rules without code changes
- Sales reps can view their own commissions without manager help
- Approval workflow reduces commission disputes by 80%
- Time to calculate monthly commissions reduced from hours to minutes

---

**Status**: Planning Complete ✅
**Next Steps**: Review with stakeholder, begin Phase 1A implementation
