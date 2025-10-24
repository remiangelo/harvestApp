-- EMERGENCY ROLLBACK SCRIPT
-- Purpose: Disable RLS and remove policies if issues occur
-- ⚠️ USE ONLY IF MIGRATION CAUSES CRITICAL ISSUES

-- ============================================
-- WARNING
-- ============================================
-- This script will:
-- 1. DISABLE RLS on all tables (removes security)
-- 2. DROP all newly created policies
--
-- Only run this if:
-- - App is completely broken after migration
-- - Users cannot access their data
-- - Critical production issue
--
-- After rollback, you will need to:
-- - Fix the issue
-- - Re-apply the migration with corrections
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Disable RLS on all affected tables
-- ============================================

ALTER TABLE public.photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gardener_interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_hobbies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop all newly created policies
-- ============================================

-- User blocks
DROP POLICY IF EXISTS "Users can view their blocks" ON public.user_blocks;
DROP POLICY IF EXISTS "Users can create blocks" ON public.user_blocks;
DROP POLICY IF EXISTS "Users can delete their blocks" ON public.user_blocks;

-- User reports
DROP POLICY IF EXISTS "Users can create reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can view their reports" ON public.user_reports;

-- Growth progress
DROP POLICY IF EXISTS "Users manage own growth progress" ON public.growth_progress;

-- Gardener interactions
DROP POLICY IF EXISTS "Users manage own gardener interactions" ON public.gardener_interactions;

-- Message reactions
DROP POLICY IF EXISTS "Users can react to messages in their conversations" ON public.message_reactions;

-- User activities
DROP POLICY IF EXISTS "Users manage own activities" ON public.user_activities;

-- Match scores
DROP POLICY IF EXISTS "Users can view their match scores" ON public.match_scores;
DROP POLICY IF EXISTS "System can insert match scores" ON public.match_scores;

-- User hobbies
DROP POLICY IF EXISTS "Users manage own hobbies" ON public.user_hobbies;

-- User rewards
DROP POLICY IF EXISTS "Users manage own rewards" ON public.user_rewards;

-- ============================================
-- STEP 3: Verify rollback
-- ============================================

DO $$
DECLARE
  table_count INT;
  policy_count INT;
BEGIN
  -- Count tables with RLS still enabled
  SELECT COUNT(*) INTO table_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND rowsecurity = true
  AND tablename IN (
    'photos', 'user_preferences', 'user_blocks', 'user_reports',
    'growth_progress', 'gardener_interactions', 'message_reactions',
    'user_activities', 'match_scores', 'user_hobbies', 'user_rewards'
  );

  -- Count policies remaining
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN (
    'user_blocks', 'user_reports', 'growth_progress',
    'gardener_interactions', 'message_reactions', 'user_activities',
    'match_scores', 'user_hobbies', 'user_rewards'
  );

  RAISE NOTICE '==========================================';
  RAISE NOTICE 'ROLLBACK VERIFICATION';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'Tables with RLS enabled: %', table_count;
  RAISE NOTICE 'Policies remaining: %', policy_count;
  RAISE NOTICE '==========================================';

  IF table_count = 0 AND policy_count = 0 THEN
    RAISE NOTICE '✅ Rollback successful - RLS disabled and policies removed';
  ELSE
    RAISE WARNING '⚠️ Some RLS/policies may remain - verify manually';
  END IF;
END;
$$;

-- ============================================
-- IMPORTANT: Review before committing
-- ============================================

-- If everything looks good, commit the transaction:
-- COMMIT;

-- If you want to cancel the rollback:
-- ROLLBACK;

-- Default: Rollback is in a transaction, so you must manually COMMIT
ROLLBACK;  -- Remove this line to allow COMMIT

-- ============================================
-- POST-ROLLBACK INSTRUCTIONS
-- ============================================

/*
After rolling back:

1. Check app functionality - everything should work (but without RLS security)
2. Identify what caused the issue:
   - Check error logs
   - Review policy logic
   - Test specific queries that failed
3. Fix the migration files
4. Test the fixed migration on staging/test environment
5. Re-apply to production when ready

Note: Your data is safe - RLS only affects access control, not data storage
*/
