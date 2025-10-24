-- RLS Policy Validation Script
-- Purpose: Verify all RLS policies are enabled and working correctly
-- Run this AFTER applying migration 010_fix_rls_policies.sql

-- ============================================
-- TEST 1: Verify RLS is enabled on all tables
-- ============================================
SELECT
  tablename,
  CASE
    WHEN rowsecurity THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'photos', 'user_preferences', 'user_blocks', 'user_reports',
  'growth_progress', 'gardener_interactions', 'message_reactions',
  'user_activities', 'match_scores', 'user_hobbies', 'user_rewards'
)
ORDER BY tablename;

-- Expected: All should show "✅ RLS ENABLED"

-- ============================================
-- TEST 2: Count policies per table
-- ============================================
SELECT
  tablename,
  COUNT(*) as policy_count,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ HAS POLICIES'
    ELSE '❌ NO POLICIES'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'photos', 'user_preferences', 'user_blocks', 'user_reports',
  'growth_progress', 'gardener_interactions', 'message_reactions',
  'user_activities', 'match_scores', 'user_hobbies', 'user_rewards'
)
GROUP BY tablename
ORDER BY tablename;

-- Expected: All tables should have at least 1 policy

-- ============================================
-- TEST 3: List all policies created
-- ============================================
SELECT
  tablename,
  policyname,
  cmd AS operation,
  CASE
    WHEN cmd = 'ALL' THEN '✅ ALL OPERATIONS'
    WHEN cmd = 'SELECT' THEN '🔍 READ ONLY'
    WHEN cmd = 'INSERT' THEN '➕ INSERT ONLY'
    WHEN cmd = 'UPDATE' THEN '✏️ UPDATE ONLY'
    WHEN cmd = 'DELETE' THEN '🗑️ DELETE ONLY'
  END as operation_type
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'photos', 'user_preferences', 'user_blocks', 'user_reports',
  'growth_progress', 'gardener_interactions', 'message_reactions',
  'user_activities', 'match_scores', 'user_hobbies', 'user_rewards'
)
ORDER BY tablename, policyname;

-- ============================================
-- TEST 4: Check for tables still missing RLS
-- ============================================
SELECT
  tablename,
  '❌ MISSING RLS' as issue
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false
AND tablename NOT IN ('spatial_ref_sys')  -- Exclude PostGIS system table
ORDER BY tablename;

-- Expected: Empty result set (no tables missing RLS)

-- ============================================
-- TEST 5: Verify specific policy logic (sample)
-- ============================================
-- Check user_blocks policies use auth.uid()
SELECT
  tablename,
  policyname,
  CASE
    WHEN qual::text LIKE '%auth.uid()%' OR with_check::text LIKE '%auth.uid()%'
    THEN '✅ Uses auth.uid()'
    ELSE '⚠️ No auth.uid() check'
  END as auth_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'user_blocks';

-- ============================================
-- TEST 6: Security Definer functions check
-- ============================================
SELECT
  n.nspname as schema,
  p.proname as function_name,
  CASE
    WHEN p.prosecdef THEN '⚠️ SECURITY DEFINER'
    ELSE '✅ SECURITY INVOKER'
  END as security_type,
  CASE
    WHEN p.proconfig::text LIKE '%search_path%' THEN '✅ search_path set'
    ELSE '❌ search_path not set'
  END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
  'check_and_create_match',
  'get_discovery_profiles',
  'get_match_status',
  'check_mutual_match',
  'get_user_quiz_history',
  'update_match_interaction',
  'get_user_matches',
  'update_user_values_sought_updated_at',
  'update_user_values_brought_updated_at',
  'update_user_insights_from_quiz',
  'update_updated_at_column',
  'update_user_safety_settings_timestamp'
)
ORDER BY function_name;

-- ============================================
-- TEST 7: Views with SECURITY DEFINER check
-- ============================================
SELECT
  schemaname,
  viewname,
  CASE
    WHEN definition LIKE '%SECURITY DEFINER%' THEN '⚠️ SECURITY DEFINER VIEW'
    ELSE '✅ Normal view'
  END as security_type
FROM pg_views
WHERE schemaname = 'public'
ORDER BY viewname;

-- ============================================
-- SUMMARY QUERY
-- ============================================
SELECT
  'Total tables with RLS enabled' as metric,
  COUNT(*)::text as value
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true

UNION ALL

SELECT
  'Total policies created',
  COUNT(*)::text
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT
  'Functions with search_path set',
  COUNT(*)::text
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proconfig::text LIKE '%search_path%'

UNION ALL

SELECT
  'Tables still missing RLS',
  COUNT(*)::text
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false
AND tablename NOT IN ('spatial_ref_sys');

-- ============================================
-- EXPECTED RESULTS AFTER SUCCESSFUL MIGRATION:
-- ============================================
-- ✅ 11+ tables with RLS enabled
-- ✅ 15+ policies created
-- ✅ 12 functions with search_path set
-- ✅ 0 tables missing RLS (except spatial_ref_sys)
