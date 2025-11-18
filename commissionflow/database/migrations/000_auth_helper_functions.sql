-- Migration 000: Auth Helper Functions
-- Run this FIRST before other migrations
-- This creates helper functions needed by RLS policies
-- NOTE: Functions are created in PUBLIC schema (not auth) due to permissions

-- ============================================================================
-- HELPER FUNCTION: Get user's organization ID
-- ============================================================================

CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_organization_id() TO service_role;

-- ============================================================================
-- HELPER FUNCTION: Get user's role
-- ============================================================================

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_role() TO service_role;

-- ============================================================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(role IN ('admin', 'manager', 'director'), false)
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- ============================================================================
-- HELPER FUNCTION: Check if user can manage rules
-- ============================================================================

CREATE OR REPLACE FUNCTION public.can_manage_rules()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(role IN ('admin', 'manager', 'director'), false)
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.can_manage_rules() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_rules() TO service_role;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Helper functions created successfully in PUBLIC schema!';
  RAISE NOTICE '  - public.user_organization_id()';
  RAISE NOTICE '  - public.user_role()';
  RAISE NOTICE '  - public.is_admin()';
  RAISE NOTICE '  - public.can_manage_rules()';
  RAISE NOTICE '';
  RAISE NOTICE 'Now run migration 001_phase1_commission_rules_system.sql';
END $$;
