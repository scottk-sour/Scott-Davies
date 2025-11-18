-- =====================================================
-- PHASE 1A: FLEXIBLE COMMISSION RULES SYSTEM
-- Migration: 001
-- Description: Add flexible commission rules engine tables
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: commission_rules
-- Stores flexible commission rule configurations
-- =====================================================

CREATE TABLE commission_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Rule identification
  name TEXT NOT NULL,
  description TEXT,

  -- Rule type
  rule_type TEXT NOT NULL CHECK (rule_type IN (
    'percentage',   -- Fixed % of profit
    'flat',        -- Fixed amount per deal/activity
    'threshold',   -- Must hit target to earn
    'tiered',      -- Different rates at different levels
    'accelerator', -- Rate increases after hitting target
    'bonus'        -- One-time bonus for achievement
  )),

  -- Who does this apply to?
  applies_to_role TEXT CHECK (applies_to_role IN (
    'sales_rep',   -- formerly 'telesales'
    'team_lead',   -- formerly 'bdm'
    'manager',
    'accounts',
    'director'
  )),
  applies_to_user_ids UUID[],  -- Specific users (individual overrides)

  -- When is this rule active?
  active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,  -- NULL = ongoing

  -- Rule configuration (flexible JSON)
  config JSONB NOT NULL,
  -- Examples:
  -- Percentage: {"rate": 0.10}
  -- Flat: {"amount": 50000, "per": "deal"}
  -- Threshold: {"threshold": 350000, "rate": 1.0, "carry_deficit": true}
  -- Tiered: {"tiers": [{"min": 0, "max": 500000, "rate": 0.08}, {"min": 500000, "rate": 0.12}]}
  -- Accelerator: {"base_rate": 0.10, "trigger": 1000000, "accelerated_rate": 0.15}
  -- Bonus: {"condition": {"monthly_sales_above": 2000000}, "bonus": 50000}

  -- Priority and stacking behavior
  priority INTEGER DEFAULT 0,  -- Higher number = applied last (wins conflicts)
  stacking_behavior TEXT DEFAULT 'replace' CHECK (stacking_behavior IN (
    'replace',   -- This rule replaces lower priority rules
    'add',       -- Add to existing commission
    'multiply',  -- Multiply existing commission
    'highest'    -- Use highest between this and others
  )),
  is_absolute BOOLEAN DEFAULT false,  -- If true, cannot be overridden by higher priority

  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_rule_name UNIQUE(organization_id, name)
);

-- Indexes for performance
CREATE INDEX idx_commission_rules_org ON commission_rules(organization_id);
CREATE INDEX idx_commission_rules_role ON commission_rules(applies_to_role) WHERE active = true;
CREATE INDEX idx_commission_rules_active ON commission_rules(active, effective_from, effective_to);
CREATE INDEX idx_commission_rules_priority ON commission_rules(priority DESC);

-- GIN index for user_ids array lookup (fast "user X has rule Y" queries)
CREATE INDEX idx_commission_rules_user_ids ON commission_rules USING GIN(applies_to_user_ids);

-- =====================================================
-- TABLE: commission_calculations
-- Stores calculated commissions with approval tracking
-- =====================================================

CREATE TABLE commission_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- What was calculated?
  user_id UUID NOT NULL REFERENCES users(id),
  rule_id UUID REFERENCES commission_rules(id),  -- Which rule generated this

  -- Time period
  calculation_period_start DATE NOT NULL,
  calculation_period_end DATE NOT NULL,
  calculation_type TEXT NOT NULL CHECK (calculation_type IN (
    'deal',      -- Single deal commission
    'monthly',   -- Monthly aggregate
    'quarterly',
    'annual',
    'manual'     -- Manual adjustment
  )),

  -- Calculation inputs (stored for audit and recalculation)
  input_data JSONB NOT NULL,
  -- Example: {
  --   "deals": ["deal-uuid-1", "deal-uuid-2"],
  --   "total_sales": 2000000,
  --   "total_profit": 1200000,
  --   "activities": {"appointments": 5, "demos": 3}
  -- }

  -- Calculation outputs (in pence)
  base_amount INTEGER NOT NULL,
  bonus_amount INTEGER DEFAULT 0,
  adjustments INTEGER DEFAULT 0,  -- Manual adjustments
  total_amount INTEGER NOT NULL,

  -- Calculation breakdown (for explainer)
  calculation_breakdown JSONB,
  -- Example: [
  --   {"step": 1, "rule": "Base 10%", "result": 120000, "explanation": "..."},
  --   {"step": 2, "rule": "Threshold", "result": 0, "explanation": "..."}
  -- ]

  -- State tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'calculated',    -- Just calculated, not yet submitted
    'pending',       -- Submitted for approval
    'manager_approved',
    'accounts_approved',
    'approved',      -- Final approval, ready for payment
    'paid',
    'rejected',
    'disputed'
  )),

  -- Approval tracking (for workflow)
  approved_by_manager UUID REFERENCES users(id),
  approved_by_manager_at TIMESTAMP WITH TIME ZONE,
  approved_by_accounts UUID REFERENCES users(id),
  approved_by_accounts_at TIMESTAMP WITH TIME ZONE,
  approved_for_payroll UUID REFERENCES users(id),
  approved_for_payroll_at TIMESTAMP WITH TIME ZONE,

  -- Notes and disputes
  notes TEXT,
  dispute_reason TEXT,

  -- Metadata
  calculated_by UUID REFERENCES users(id),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(organization_id, user_id, calculation_period_start, calculation_period_end, calculation_type)
);

-- Indexes
CREATE INDEX idx_commission_calculations_org ON commission_calculations(organization_id);
CREATE INDEX idx_commission_calculations_user ON commission_calculations(user_id);
CREATE INDEX idx_commission_calculations_rule ON commission_calculations(rule_id);
CREATE INDEX idx_commission_calculations_period ON commission_calculations(calculation_period_start, calculation_period_end);
CREATE INDEX idx_commission_calculations_status ON commission_calculations(status);
CREATE INDEX idx_commission_calculations_pending_approval ON commission_calculations(status) WHERE status IN ('pending', 'manager_approved');

-- =====================================================
-- TABLE: commission_rule_history
-- Audit trail for rule changes
-- =====================================================

CREATE TABLE commission_rule_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES commission_rules(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- What changed?
  changed_by UUID REFERENCES users(id),
  change_type TEXT NOT NULL CHECK (change_type IN (
    'created',
    'updated',
    'deactivated',
    'deleted'
  )),
  change_reason TEXT,

  -- Snapshot of rule at this point in time
  rule_snapshot JSONB NOT NULL,

  -- When
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_commission_rule_history_rule ON commission_rule_history(rule_id);
CREATE INDEX idx_commission_rule_history_org ON commission_rule_history(organization_id);
CREATE INDEX idx_commission_rule_history_changed_at ON commission_rule_history(changed_at DESC);

-- =====================================================
-- TABLE: sales_activities
-- Track appointments, demos, calls, etc. for flat-rate commissions
-- =====================================================

CREATE TABLE sales_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),

  -- What type of activity?
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'appointment',
    'demo',
    'lead',
    'call',
    'meeting',
    'quote',
    'site_visit'
  )),

  -- When?
  activity_date DATE NOT NULL,

  -- Details
  customer_name TEXT,
  customer_contact TEXT,
  notes TEXT,
  value_estimate INTEGER,  -- Expected deal value (in pence)

  -- Verification (prevents fake entries)
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,

  -- Optional: Link to deal if converted
  converted_to_deal_id UUID REFERENCES deals(id),
  converted_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sales_activities_user ON sales_activities(user_id);
CREATE INDEX idx_sales_activities_date ON sales_activities(activity_date);
CREATE INDEX idx_sales_activities_type ON sales_activities(activity_type);
CREATE INDEX idx_sales_activities_verified ON sales_activities(verified);
CREATE INDEX idx_sales_activities_org ON sales_activities(organization_id);

-- =====================================================
-- MODIFY EXISTING TABLES
-- =====================================================

-- Add reports_to field for team hierarchy
ALTER TABLE users ADD COLUMN IF NOT EXISTS reports_to UUID REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_users_reports_to ON users(reports_to);

-- Add feature flag for gradual rollout
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS use_flexible_rules BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_organizations_flexible_rules ON organizations(use_flexible_rules) WHERE use_flexible_rules = true;

-- Rename legacy commission fields (don't drop yet!)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='deals' AND column_name='telesales_commission') THEN
    ALTER TABLE deals RENAME COLUMN telesales_commission TO telesales_commission_legacy;
    COMMENT ON COLUMN deals.telesales_commission_legacy IS 'DEPRECATED: Use commission_calculations table';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='deals' AND column_name='remaining_profit') THEN
    ALTER TABLE deals RENAME COLUMN remaining_profit TO remaining_profit_legacy;
    COMMENT ON COLUMN deals.remaining_profit_legacy IS 'DEPRECATED: Use commission_calculations table';
  END IF;
END $$;

-- Add approval status to deals (for future workflow)
ALTER TABLE deals ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'draft'
  CHECK (approval_status IN ('draft', 'pending_approval', 'approved', 'rejected'));
ALTER TABLE deals ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_commission_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_commission_rules_updated_at
  BEFORE UPDATE ON commission_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_commission_updated_at();

CREATE TRIGGER update_commission_calculations_updated_at
  BEFORE UPDATE ON commission_calculations
  FOR EACH ROW
  EXECUTE FUNCTION update_commission_updated_at();

CREATE TRIGGER update_sales_activities_updated_at
  BEFORE UPDATE ON sales_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_commission_updated_at();

-- Auto-log rule changes to history
CREATE OR REPLACE FUNCTION log_commission_rule_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO commission_rule_history (
      rule_id, organization_id, changed_by, change_type, rule_snapshot
    ) VALUES (
      NEW.id, NEW.organization_id, NEW.created_by, 'created',
      to_jsonb(NEW)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO commission_rule_history (
      rule_id, organization_id, changed_by, change_type, rule_snapshot
    ) VALUES (
      NEW.id, NEW.organization_id, NEW.created_by,
      CASE WHEN NEW.active = false AND OLD.active = true THEN 'deactivated' ELSE 'updated' END,
      to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_commission_rule_changes
  AFTER INSERT OR UPDATE ON commission_rules
  FOR EACH ROW
  EXECUTE FUNCTION log_commission_rule_change();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rule_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_activities ENABLE ROW LEVEL SECURITY;

-- Commission Rules: Only directors can manage, everyone can view
CREATE POLICY "Users can view organization rules"
  ON commission_rules FOR SELECT
  USING (organization_id = public.user_organization_id());

CREATE POLICY "Directors can manage rules"
  ON commission_rules FOR ALL
  USING (
    organization_id = public.user_organization_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'director')
  );

-- Commission Calculations: Role-based access
CREATE POLICY "Users can view own calculations"
  ON commission_calculations FOR SELECT
  USING (
    organization_id = public.user_organization_id() AND
    (
      user_id = auth.uid() OR  -- Own calculations
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('manager', 'accounts', 'director'))  -- Privileged roles
    )
  );

CREATE POLICY "Managers can create calculations"
  ON commission_calculations FOR INSERT
  WITH CHECK (
    organization_id = public.user_organization_id() AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('manager', 'director'))
  );

-- Sales Activities: Own activities + managers can see all
CREATE POLICY "Users can view own activities"
  ON sales_activities FOR SELECT
  USING (
    organization_id = public.user_organization_id() AND
    (
      user_id = auth.uid() OR
      EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('manager', 'director'))
    )
  );

CREATE POLICY "Users can create own activities"
  ON sales_activities FOR INSERT
  WITH CHECK (
    organization_id = public.user_organization_id() AND
    user_id = auth.uid()
  );

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Active rules per user (pre-joined for performance)
CREATE OR REPLACE VIEW active_rules_per_user AS
SELECT
  u.id AS user_id,
  u.organization_id,
  u.role,
  cr.id AS rule_id,
  cr.name AS rule_name,
  cr.rule_type,
  cr.config,
  cr.priority,
  cr.stacking_behavior,
  cr.effective_from,
  cr.effective_to
FROM users u
CROSS JOIN commission_rules cr
WHERE
  cr.active = true
  AND cr.organization_id = u.organization_id
  AND (
    cr.applies_to_role = u.role OR
    u.id = ANY(cr.applies_to_user_ids)
  )
  AND (
    cr.effective_from <= CURRENT_DATE AND
    (cr.effective_to IS NULL OR cr.effective_to >= CURRENT_DATE)
  )
ORDER BY u.id, cr.priority DESC;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Phase 1A migration complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  - commission_rules';
  RAISE NOTICE '  - commission_calculations';
  RAISE NOTICE '  - commission_rule_history';
  RAISE NOTICE '  - sales_activities';
  RAISE NOTICE '';
  RAISE NOTICE 'Modified tables:';
  RAISE NOTICE '  - users (added reports_to)';
  RAISE NOTICE '  - organizations (added use_flexible_rules)';
  RAISE NOTICE '  - deals (renamed legacy fields, added approval_status)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run seed script to create default rules';
END $$;
