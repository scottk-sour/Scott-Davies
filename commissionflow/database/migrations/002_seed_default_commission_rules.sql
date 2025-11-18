-- =====================================================
-- PHASE 1A: SEED DEFAULT COMMISSION RULES
-- Migration: 002
-- Description: Create default starter rules for each role
-- =====================================================

-- This script creates default commission rules for all existing organizations
-- These are STARTER rules that users can customize

DO $$
DECLARE
  org RECORD;
  rule_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Seeding default commission rules...';

  -- Loop through all organizations
  FOR org IN SELECT id, name FROM organizations
  LOOP
    RAISE NOTICE 'Processing organization: %', org.name;

    -- =====================================================
    -- Rule 1: Manager - 20% of profit
    -- =====================================================
    INSERT INTO commission_rules (
      organization_id,
      name,
      description,
      rule_type,
      applies_to_role,
      active,
      effective_from,
      config,
      priority,
      stacking_behavior,
      is_absolute
    ) VALUES (
      org.id,
      'Manager Standard Commission',
      'Standard 20% commission on profit for managers',
      'percentage',
      'manager',
      true,
      CURRENT_DATE,
      jsonb_build_object('rate', 0.20),
      0,
      'replace',
      false
    );
    rule_count := rule_count + 1;

    -- =====================================================
    -- Rule 2: Director - 15% of profit
    -- =====================================================
    INSERT INTO commission_rules (
      organization_id,
      name,
      description,
      rule_type,
      applies_to_role,
      active,
      effective_from,
      config,
      priority,
      stacking_behavior,
      is_absolute
    ) VALUES (
      org.id,
      'Director Standard Commission',
      'Standard 15% commission on profit for directors',
      'percentage',
      'director',
      true,
      CURRENT_DATE,
      jsonb_build_object('rate', 0.15),
      0,
      'replace',
      false
    );
    rule_count := rule_count + 1;

    -- =====================================================
    -- Rule 3: Field Rep - Per Activity + Per Deal
    -- =====================================================
    INSERT INTO commission_rules (
      organization_id,
      name,
      description,
      rule_type,
      applies_to_role,
      active,
      effective_from,
      config,
      priority,
      stacking_behavior,
      is_absolute
    ) VALUES (
      org.id,
      'Field Rep Activity Commission',
      'Flat rate per appointment and per deal for field reps',
      'flat',
      'sales_rep',
      true,
      CURRENT_DATE,
      jsonb_build_object(
        'amount_per_appointment', 5000,
        'amount_per_deal', 20000
      ),
      0,
      'replace',
      false
    );
    rule_count := rule_count + 1;

    -- =====================================================
    -- Rule 4: Telesales - Per Activity + Per Deal
    -- =====================================================
    INSERT INTO commission_rules (
      organization_id,
      name,
      description,
      rule_type,
      applies_to_role,
      active,
      effective_from,
      config,
      priority,
      stacking_behavior,
      is_absolute
    ) VALUES (
      org.id,
      'Telesales Activity Commission',
      'Flat rate per appointment and per deal for telesales reps',
      'flat',
      'sales_rep',
      true,
      CURRENT_DATE,
      jsonb_build_object(
        'amount_per_appointment', 2500,
        'amount_per_deal', 15000
      ),
      0,
      'replace',
      false
    );
    rule_count := rule_count + 1;

    RAISE NOTICE '  Created 4 default rules for %', org.name;
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE 'Success! Created % rules total', rule_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Navigate to /commission-rules to view and customize';
  RAISE NOTICE '  2. Use the what-if calculator to test scenarios';
  RAISE NOTICE '  3. Run dry run tests before deploying to production';
END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Run this to verify rules were created:
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 Verification Summary:';
  RAISE NOTICE '';
END $$;

SELECT
  o.name AS organization,
  COUNT(cr.id) AS rules_count,
  json_agg(
    json_build_object(
      'name', cr.name,
      'type', cr.rule_type,
      'role', cr.applies_to_role,
      'active', cr.active
    ) ORDER BY cr.priority DESC
  ) AS rules
FROM organizations o
LEFT JOIN commission_rules cr ON cr.organization_id = o.id
GROUP BY o.id, o.name
ORDER BY o.name;

-- Expected result: Each organization should have 2 rules
-- If you see 0 rules for an org, the seed script didn't run properly
