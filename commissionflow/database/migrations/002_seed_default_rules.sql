-- =====================================================
-- SEED: Default Commission Rules (4 Examples)
-- =====================================================

-- Get the first organization (for demo purposes)
-- In production, you'd run this per organization
DO $$
DECLARE
  org_id UUID;
BEGIN
  -- Get first organization ID
  SELECT id INTO org_id FROM organizations LIMIT 1;

  IF org_id IS NULL THEN
    RAISE EXCEPTION 'No organization found. Please create an organization first.';
  END IF;

  -- =====================================================
  -- Rule 1: Tiered Volume Bonus
  -- =====================================================
  INSERT INTO commission_rules (
    organization_id,
    name,
    description,
    rule_type,
    applies_to_role,
    active,
    config,
    priority,
    stacking_behavior
  ) VALUES (
    org_id,
    'Tiered Volume Bonus',
    'Earn higher commission rates as you hit volume milestones',
    'tiered',
    'sales_rep',
    true,
    '{
      "tiers": [
        {"from": 0, "to": 50000, "rate": 0.10},
        {"from": 50000, "to": 100000, "rate": 0.12},
        {"from": 100000, "to": null, "rate": 0.15}
      ],
      "applies_to": "total_deal_value",
      "period": "monthly"
    }'::jsonb,
    100,
    'replace'
  );

  -- =====================================================
  -- Rule 2: Product Category Multiplier
  -- =====================================================
  INSERT INTO commission_rules (
    organization_id,
    name,
    description,
    rule_type,
    applies_to_role,
    active,
    config,
    priority,
    stacking_behavior
  ) VALUES (
    org_id,
    'Product Category Multiplier',
    'Earn bonus commission on premium product categories',
    'percentage',
    'sales_rep',
    true,
    '{
      "base_rate": 0.05,
      "category_multipliers": {
        "premium": 1.5,
        "enterprise": 2.0,
        "standard": 1.0
      },
      "applies_to": "profit"
    }'::jsonb,
    80,
    'add'
  );

  -- =====================================================
  -- Rule 3: New Customer Bonus
  -- =====================================================
  INSERT INTO commission_rules (
    organization_id,
    name,
    description,
    rule_type,
    applies_to_role,
    active,
    config,
    priority,
    stacking_behavior
  ) VALUES (
    org_id,
    'New Customer Bonus',
    'One-time bonus for closing deals with new customers',
    'bonus',
    'sales_rep',
    true,
    '{
      "bonus_amount": 500,
      "condition": "new_customer",
      "min_deal_value": 10000,
      "currency": "GBP"
    }'::jsonb,
    90,
    'add'
  );

  -- =====================================================
  -- Rule 4: Team Performance Boost
  -- =====================================================
  INSERT INTO commission_rules (
    organization_id,
    name,
    description,
    rule_type,
    applies_to_role,
    active,
    config,
    priority,
    stacking_behavior
  ) VALUES (
    org_id,
    'Team Performance Boost',
    'Additional bonus when team hits collective targets',
    'accelerator',
    'sales_rep',
    true,
    '{
      "threshold": 200000,
      "bonus_multiplier": 1.25,
      "applies_to": "team_total",
      "period": "monthly"
    }'::jsonb,
    70,
    'multiply'
  );

  RAISE NOTICE '✅ Successfully created 4 default commission rules for organization %', org_id;

END $$;
