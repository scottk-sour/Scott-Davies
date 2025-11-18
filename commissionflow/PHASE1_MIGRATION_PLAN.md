# Phase 1: Migration Plan - From Hardcoded to Flexible Rules

## Executive Summary

This document outlines the step-by-step migration from the current MVP (with hardcoded 10% telesales and £3,500 BDM threshold) to the new flexible commission rules engine. The migration is designed to be **zero-downtime** and **backward-compatible** throughout the transition period.

---

## Migration Principles

1. **Zero Downtime**: App continues working throughout migration
2. **Backward Compatible**: Existing deals and calculations remain valid
3. **Dual-Write Period**: Write to both old and new systems during transition
4. **Feature Flags**: Gradual rollout per organization
5. **Data Integrity**: All historical data preserved
6. **Rollback Ready**: Can revert at any stage if issues arise

---

## Current State Analysis

### What Works Today

**Telesales Commission**:
- Calculated at deal creation time
- Formula: `initial_profit × 0.10` (10%)
- Stored on `deals.telesales_commission_legacy`

**BDM Commission**:
- Calculated monthly via `CommissionCalculator.calculateMonthlyBDMCommission()`
- Deficit model with £3,500 threshold
- Stored in `commission_records` table
- Uses `month_paid` date to determine which month

**User Roles**:
- `admin`, `manager`, `telesales`, `bdm`

**Commission Calculation Flow**:
```
Deal Created → Calculate Telesales (10%) → Store on Deal
Deal Marked Paid → Trigger BDM Calculation → Store in commission_records
Month End → Generate Report from commission_records
```

### Problems with Current System

1. Commission rates hardcoded in application logic
2. Cannot support multiple commission structures per organization
3. No approval workflow - commissions calculated = commissions owed
4. No role-based access control for sensitive data
5. Cannot handle tiered rates, bonuses, or split commissions
6. Difficult to make changes without code deployment

---

## Migration Phases

### Phase 1A: Database Schema Changes (Week 1)

**Goal**: Add new tables without breaking existing functionality

**Steps**:

1. **Run New Schema Migration**
```sql
-- Create new tables (non-breaking)
-- See PHASE1_REFACTOR_PLAN.md for full schema

-- New commission system tables
CREATE TABLE commission_rules (...);
CREATE TABLE commission_calculations (...);
CREATE TABLE commission_rule_history (...);

-- RBAC tables
CREATE TABLE user_permissions (...);

-- Approval workflow tables
CREATE TABLE approval_workflows (...);
CREATE TABLE approval_requests (...);
CREATE TABLE approval_actions (...);

-- Add new fields to existing tables (non-breaking)
ALTER TABLE users ADD COLUMN reports_to UUID REFERENCES users(id);
ALTER TABLE deals ADD COLUMN approval_status TEXT DEFAULT 'draft';
ALTER TABLE deals ADD COLUMN approved_by UUID REFERENCES users(id);
ALTER TABLE deals ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;

-- Rename old fields (but keep them for now)
ALTER TABLE deals RENAME COLUMN telesales_commission TO telesales_commission_legacy;
ALTER TABLE deals RENAME COLUMN remaining_profit TO remaining_profit_legacy;
```

2. **Deploy Schema to Production**
- Run migration during low-traffic period
- Verify all tables created successfully
- Existing app continues working with legacy fields

3. **Add Indexes**
```sql
-- See full list in PHASE1_REFACTOR_PLAN.md
CREATE INDEX idx_commission_rules_org ON commission_rules(organization_id);
CREATE INDEX idx_commission_calculations_user ON commission_calculations(user_id);
-- etc.
```

**Verification**:
- [ ] All new tables exist
- [ ] Old fields still exist and functional
- [ ] Existing app still works
- [ ] Can roll back by dropping new tables if needed

---

### Phase 1B: Seed Default Rules (Week 1)

**Goal**: Create default commission rules matching current hardcoded logic

**Migration Script**:
```typescript
// scripts/seed-default-rules.ts

import { prisma } from '@/lib/db'

async function seedDefaultCommissionRules() {
  const orgs = await prisma.organizations.findMany()

  for (const org of orgs) {
    console.log(`Seeding rules for ${org.name}...`)

    // 1. Create telesales rule (10% - matches current behavior)
    const telesalesRule = await prisma.commission_rules.create({
      data: {
        organization_id: org.id,
        name: 'Standard Telesales Commission (10%)',
        description: 'Default 10% commission on initial profit (migrated from legacy system)',
        rule_type: 'percentage',
        applies_to_role: 'sales_rep', // Will migrate telesales → sales_rep later
        active: true,
        effective_from: new Date('2020-01-01'), // Retroactive
        config: {
          rate: 0.10,
        },
        priority: 0,
      },
    })

    console.log(`  ✅ Created telesales rule: ${telesalesRule.id}`)

    // 2. Create BDM rule (threshold - matches current behavior)
    const bdmRule = await prisma.commission_rules.create({
      data: {
        organization_id: org.id,
        name: 'BDM Threshold Commission (£3,500)',
        description: 'Monthly threshold of £3,500 with deficit carryover (migrated from legacy system)',
        rule_type: 'threshold',
        applies_to_role: 'team_lead', // Will migrate bdm → team_lead later
        active: true,
        effective_from: new Date('2020-01-01'),
        config: {
          threshold: org.bdm_threshold_amount || 350000, // £3,500 in pence
          rate: org.bdm_commission_rate || 1.0, // 100%
          carry_deficit: true,
        },
        priority: 0,
      },
    })

    console.log(`  ✅ Created BDM rule: ${bdmRule.id}`)

    // 3. Create default approval workflow
    const workflow = await prisma.approval_workflows.create({
      data: {
        organization_id: org.id,
        name: 'Standard Commission Approval',
        workflow_type: 'commission',
        stages: [
          { stage: 1, role: 'manager', required: true },
          { stage: 2, role: 'accounts', required: true },
        ],
        auto_approve_if: {
          amount_under: 10000, // Auto-approve under £100
        },
        active: true,
      },
    })

    console.log(`  ✅ Created approval workflow: ${workflow.id}`)
  }

  console.log('\n✅ Default rules seeded for all organizations')
}

// Run it
seedDefaultCommissionRules()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  })
```

**Run Migration**:
```bash
npm run ts-node scripts/seed-default-rules.ts
```

**Verification**:
- [ ] Each organization has 2 commission rules
- [ ] Rules match current hardcoded logic
- [ ] Each organization has 1 approval workflow
- [ ] Can query rules via SQL

---

### Phase 1C: Build New Commission Engine (Week 2)

**Goal**: Create new flexible commission engine alongside old one

**Steps**:

1. **Create New Commission Engine**
```typescript
// lib/commission-engine-v2.ts

export class CommissionEngineV2 {
  async calculateCommission(
    organizationId: string,
    userId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<CommissionCalculation> {
    // 1. Get applicable rules for user
    const rules = await this.getApplicableRules(organizationId, userId)

    // 2. Get deals in period
    const deals = await this.getDealsInPeriod(userId, periodStart, periodEnd)

    // 3. Apply each rule
    const calculations = []
    for (const rule of rules) {
      const calc = await this.applyRule(rule, deals, periodStart, periodEnd)
      calculations.push(calc)
    }

    return calculations
  }

  private async applyRule(rule, deals, periodStart, periodEnd) {
    switch (rule.rule_type) {
      case 'percentage':
        return this.calculatePercentage(rule, deals)
      case 'threshold':
        return this.calculateThreshold(rule, deals, periodStart)
      case 'tiered':
        return this.calculateTiered(rule, deals)
      // etc.
    }
  }

  // See PHASE1_REFACTOR_PLAN.md for full implementation
}

export const commissionEngineV2 = new CommissionEngineV2()
```

2. **Add Feature Flag per Organization**
```sql
ALTER TABLE organizations ADD COLUMN use_flexible_rules BOOLEAN DEFAULT false;
```

3. **Create Dual-Write Logic**
```typescript
// lib/commission-calculator-hybrid.ts

export async function calculateAndSaveCommission(
  userId: string,
  periodStart: Date,
  periodEnd: Date
) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { organization: true },
  })

  if (user.organization.use_flexible_rules) {
    // Use NEW engine
    return commissionEngineV2.calculateCommission(
      user.organization_id,
      userId,
      periodStart,
      periodEnd
    )
  } else {
    // Use OLD engine (backward compatible)
    return commissionCalculator.calculateMonthlyBDMCommission(
      user.organization_id,
      userId,
      periodStart.getMonth() + 1,
      periodStart.getFullYear()
    )
  }
}
```

**Verification**:
- [ ] New engine works in tests
- [ ] Can calculate using both old and new engines
- [ ] Results match for default rules
- [ ] Feature flag controls which engine is used

---

### Phase 1D: Migrate User Roles (Week 2)

**Goal**: Update user roles to new schema

**Migration Script**:
```typescript
// scripts/migrate-user-roles.ts

async function migrateUserRoles() {
  console.log('Migrating user roles...')

  // First, temporarily disable the CHECK constraint
  await prisma.$executeRawUnsafe(`
    ALTER TABLE users DROP CONSTRAINT users_role_check;
  `)

  // Update roles
  const updates = [
    { from: 'telesales', to: 'sales_rep' },
    { from: 'bdm', to: 'team_lead' },
    { from: 'admin', to: 'director' },
    // 'manager' stays as 'manager'
  ]

  for (const { from, to } of updates) {
    const result = await prisma.$executeRaw`
      UPDATE users SET role = ${to} WHERE role = ${from}
    `
    console.log(`  ✅ Migrated ${result} users from ${from} to ${to}`)
  }

  // Add new CHECK constraint with new roles
  await prisma.$executeRawUnsafe(`
    ALTER TABLE users ADD CONSTRAINT users_role_check
      CHECK (role IN ('sales_rep', 'team_lead', 'manager', 'accounts', 'director'));
  `)

  console.log('✅ Role migration complete')
}

migrateUserRoles()
```

**Update Commission Rules to Match New Roles**:
```typescript
// Update rules after role migration
async function updateRuleRoles() {
  await prisma.commission_rules.updateMany({
    where: { applies_to_role: 'telesales' },
    data: { applies_to_role: 'sales_rep' },
  })

  await prisma.commission_rules.updateMany({
    where: { applies_to_role: 'bdm' },
    data: { applies_to_role: 'team_lead' },
  })

  console.log('✅ Updated commission rules with new roles')
}
```

**Verification**:
- [ ] No users have old role names
- [ ] All users have valid new roles
- [ ] Commission rules reference new roles
- [ ] Login still works

---

### Phase 1E: Build New UI (Week 3)

**Goal**: Create UI for new features without breaking existing UI

**New Pages to Build**:

1. **Commission Rules Management** (`/settings/rules`)
   - List all rules
   - Create new rule
   - Edit existing rule
   - View rule history

2. **Approval Dashboard** (`/approvals`)
   - List pending approvals
   - Approve/reject actions
   - View approval history

3. **Sales Rep Portal** (`/my-commissions`)
   - View own commissions
   - View own deals
   - Download statements

**Keep Existing Pages Working**:
- Old reports page continues to work
- Old dashboard continues to show commission data

**Verification**:
- [ ] New pages accessible by appropriate roles
- [ ] Old pages still functional
- [ ] Can create commission rules via UI
- [ ] Can approve commissions via UI

---

### Phase 1F: Parallel Testing (Week 4)

**Goal**: Run both old and new engines side-by-side, compare results

**Testing Script**:
```typescript
// scripts/validate-new-engine.ts

async function validateNewEngine() {
  const orgs = await prisma.organizations.findMany({
    where: { use_flexible_rules: false }, // Still on old engine
  })

  for (const org of orgs) {
    console.log(`\nTesting ${org.name}...`)

    const users = await prisma.users.findMany({
      where: {
        organization_id: org.id,
        role: 'team_lead',
        active: true,
      },
    })

    for (const user of users) {
      // Calculate with OLD engine
      const oldResult = await commissionCalculator.calculateMonthlyBDMCommission(
        org.id,
        user.id,
        11, // November
        2025
      )

      // Calculate with NEW engine
      const newResult = await commissionEngineV2.calculateCommission(
        org.id,
        user.id,
        new Date(2025, 10, 1), // Nov 1
        new Date(2025, 10, 30) // Nov 30
      )

      // Compare results
      const oldAmount = oldResult.bdmCommission
      const newAmount = newResult[0].total_amount // First rule

      if (oldAmount !== newAmount) {
        console.log(`  ❌ MISMATCH for ${user.name}:`)
        console.log(`     Old: £${oldAmount / 100}`)
        console.log(`     New: £${newAmount / 100}`)
        console.log(`     Diff: £${(newAmount - oldAmount) / 100}`)
      } else {
        console.log(`  ✅ Match for ${user.name}: £${oldAmount / 100}`)
      }
    }
  }
}

validateNewEngine()
```

**Run Tests**:
```bash
npm run ts-node scripts/validate-new-engine.ts
```

**Fix Discrepancies**:
- If results don't match, debug new engine
- Ensure default rules exactly match old logic
- Update rule configs if needed

**Verification**:
- [ ] Old and new engines produce identical results
- [ ] All test cases pass
- [ ] Edge cases handled (e.g., deficit carryover)

---

### Phase 1G: Pilot Rollout (Week 5)

**Goal**: Enable new system for 1-2 pilot organizations

**Select Pilot Organizations**:
- Choose 1-2 friendly customers
- Preferably smaller organizations
- Good communication channel

**Enable Feature Flag**:
```sql
UPDATE organizations
SET use_flexible_rules = true
WHERE id IN ('pilot-org-1-uuid', 'pilot-org-2-uuid');
```

**Monitor Closely**:
- Daily check-ins with pilot users
- Watch for calculation errors
- Monitor performance metrics
- Collect feedback on UI/UX

**Metrics to Track**:
- Calculation accuracy (compare to manual calculations)
- Performance (time to calculate commissions)
- User satisfaction (survey)
- Bug reports

**Rollback Plan**:
```sql
-- If issues arise, revert pilot org
UPDATE organizations
SET use_flexible_rules = false
WHERE id = 'pilot-org-uuid';
```

**Verification**:
- [ ] Pilot org using new engine
- [ ] No calculation errors reported
- [ ] UI works as expected
- [ ] Approval workflow functional

---

### Phase 1H: Full Rollout (Week 6-7)

**Goal**: Enable new system for all organizations

**Rollout Strategy**:

1. **Week 6: 25% of orgs**
   ```sql
   -- Enable for 25% of organizations (sorted by ID for consistency)
   UPDATE organizations
   SET use_flexible_rules = true
   WHERE id IN (
     SELECT id FROM organizations
     WHERE use_flexible_rules = false
     ORDER BY id
     LIMIT (SELECT COUNT(*) / 4 FROM organizations WHERE use_flexible_rules = false)
   );
   ```

2. **Monitor for 2-3 days**
   - Check error logs
   - Review support tickets
   - Verify calculations

3. **Week 6: Next 25% (50% total)**
   - Same query, next batch
   - Continue monitoring

4. **Week 7: Next 25% (75% total)**
   - Same process

5. **Week 7: Final 25% (100%)**
   - Enable for all remaining orgs

**Communication**:
- Email all users about new features
- Highlight: Commission rules now configurable
- Provide link to documentation
- Offer training webinars

**Verification**:
- [ ] All organizations on new system
- [ ] No widespread issues
- [ ] Support ticket volume normal
- [ ] Calculations accurate

---

### Phase 1I: Data Cleanup (Week 8+)

**Goal**: Remove old legacy fields and code

**Wait Period**: Minimum 2 weeks after 100% rollout

**Steps**:

1. **Mark Old Calculator as Deprecated**
```typescript
// lib/commission-calculator.ts

/**
 * @deprecated This calculator is deprecated. Use CommissionEngineV2 instead.
 * This file will be removed in v2.0.0
 */
export class CommissionCalculator {
  // ...
}
```

2. **Remove Feature Flag** (after 1 month)
```sql
-- All orgs should be on new system by now
ALTER TABLE organizations DROP COLUMN use_flexible_rules;
```

3. **Drop Legacy Fields** (after 2 months)
```sql
-- Backup data first!
-- Create backup table
CREATE TABLE deals_legacy_backup AS
SELECT id, telesales_commission_legacy, remaining_profit_legacy
FROM deals;

-- Drop legacy columns
ALTER TABLE deals DROP COLUMN telesales_commission_legacy;
ALTER TABLE deals DROP COLUMN remaining_profit_legacy;
```

4. **Delete Old Code**
- Remove `lib/commission-calculator.ts`
- Remove old API routes
- Remove old UI components

**Verification**:
- [ ] Backup created
- [ ] Legacy fields dropped
- [ ] Old code removed
- [ ] App still works

---

## Rollback Procedures

### If Issues Found During Pilot (Phase 1G)

```sql
-- Revert pilot organization
UPDATE organizations
SET use_flexible_rules = false
WHERE id = 'pilot-org-uuid';

-- App will immediately use old calculator
-- No data loss - both systems write to separate tables
```

### If Issues Found During Rollout (Phase 1H)

```sql
-- Revert all organizations
UPDATE organizations SET use_flexible_rules = false;

-- Or revert specific percentage
UPDATE organizations
SET use_flexible_rules = false
WHERE id IN (SELECT id FROM organizations ORDER BY id DESC LIMIT 100);
```

### Nuclear Rollback (Worst Case)

```sql
-- 1. Revert all orgs to old system
UPDATE organizations SET use_flexible_rules = false;

-- 2. Drop new tables (keeps old tables intact)
DROP TABLE IF EXISTS approval_actions CASCADE;
DROP TABLE IF EXISTS approval_requests CASCADE;
DROP TABLE IF EXISTS approval_workflows CASCADE;
DROP TABLE IF EXISTS commission_calculations CASCADE;
DROP TABLE IF EXISTS commission_rule_history CASCADE;
DROP TABLE IF EXISTS commission_rules CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;

-- 3. Restore legacy field names
ALTER TABLE deals RENAME COLUMN telesales_commission_legacy TO telesales_commission;
ALTER TABLE deals RENAME COLUMN remaining_profit_legacy TO remaining_profit;

-- 4. Deploy previous version of code
git revert HEAD
git push origin main
```

**Recovery Time**: < 30 minutes with this approach

---

## Testing Checklist

### Before Each Phase

- [ ] Database backup taken
- [ ] Staging environment tested
- [ ] Rollback procedure documented
- [ ] Support team notified
- [ ] Monitoring alerts configured

### After Each Phase

- [ ] Smoke tests pass
- [ ] No error spikes in logs
- [ ] Performance metrics normal
- [ ] User feedback collected
- [ ] Documentation updated

---

## Success Criteria

### Technical Success
- ✅ Zero data loss
- ✅ Zero calculation errors
- ✅ < 5 support tickets related to migration
- ✅ Page load times unchanged (< 2 seconds)
- ✅ API response times unchanged (< 500ms)

### Business Success
- ✅ Users can configure their own commission rules
- ✅ Approval workflow reduces disputes
- ✅ Sales reps can view own commissions
- ✅ Time to calculate monthly commissions reduced by 80%

---

## Timeline Summary

| Week | Phase | Goal | Risk |
|------|-------|------|------|
| 1 | 1A-1B | Schema + Seed Rules | Low |
| 2 | 1C-1D | New Engine + Role Migration | Medium |
| 3 | 1E | Build New UI | Low |
| 4 | 1F | Parallel Testing | Low |
| 5 | 1G | Pilot Rollout (1-2 orgs) | Medium |
| 6-7 | 1H | Full Rollout (all orgs) | Medium |
| 8+ | 1I | Data Cleanup | Low |

**Total Timeline**: 7-8 weeks

---

## Communication Plan

### Before Migration (Week 0)
- Email all users: "Exciting updates coming to CommissionFlow"
- Blog post: What's new in Phase 1

### During Pilot (Week 5)
- Email pilot users: "You're invited to test our new features"
- Collect feedback via survey

### During Rollout (Week 6-7)
- Email all users: "New features now available"
- Offer training webinar
- Update help documentation

### After Migration (Week 8+)
- Case study: "How CommissionFlow migrated to flexible rules"
- Email: "What's next - Phase 2 preview"

---

## Monitoring & Alerts

### Key Metrics to Watch

1. **Error Rate**
   - Alert if error rate > 1%
   - Monitor commission calculation errors specifically

2. **Performance**
   - Alert if API response time > 1 second
   - Monitor database query times

3. **Data Quality**
   - Daily check: Do new calculations match old?
   - Alert if discrepancy > £1

4. **User Adoption**
   - Track: How many orgs creating custom rules?
   - Track: How many approvals processed?

### Monitoring Tools
- Vercel Analytics for frontend
- PostgreSQL slow query log
- Sentry for error tracking
- Custom dashboard for commission accuracy

---

## Conclusion

This migration plan ensures a smooth transition from hardcoded commission logic to a flexible rules engine. By following these phases carefully, we can:

- Maintain zero downtime
- Preserve all historical data
- Roll back at any stage if needed
- Gradually increase confidence through pilot testing
- Achieve full feature parity before sunset of old system

**Status**: Plan Complete ✅
**Next Step**: Review with team, get approval to begin Phase 1A

---

**Questions or Concerns?**
Contact: Engineering Team Lead
