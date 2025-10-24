-- Migration: Fix RLS on all public tables
-- Created: 2025-01-25
-- Purpose: Enable RLS and create policies for security compliance
-- Fixes: 14 tables missing RLS or have RLS disabled

-- ============================================
-- PART 1: ENABLE RLS ON TABLES WITH EXISTING POLICIES
-- ============================================

-- These tables already have policies defined, just enable RLS
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 2: ENABLE RLS ON TABLES WITHOUT POLICIES
-- ============================================

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gardener_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- Note: spatial_ref_sys is a PostGIS system table and can remain without RLS

-- ============================================
-- PART 3: CREATE POLICIES FOR USER_BLOCKS
-- ============================================

DROP POLICY IF EXISTS "Users can view their blocks" ON public.user_blocks;
CREATE POLICY "Users can view their blocks" ON public.user_blocks
  FOR SELECT
  USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can create blocks" ON public.user_blocks;
CREATE POLICY "Users can create blocks" ON public.user_blocks
  FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can delete their blocks" ON public.user_blocks;
CREATE POLICY "Users can delete their blocks" ON public.user_blocks
  FOR DELETE
  USING (auth.uid() = blocker_id);

-- ============================================
-- PART 4: CREATE POLICIES FOR USER_REPORTS
-- ============================================

DROP POLICY IF EXISTS "Users can create reports" ON public.user_reports;
CREATE POLICY "Users can create reports" ON public.user_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view their reports" ON public.user_reports;
CREATE POLICY "Users can view their reports" ON public.user_reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- ============================================
-- PART 5: CREATE POLICIES FOR GROWTH_PROGRESS
-- ============================================

DROP POLICY IF EXISTS "Users manage own growth progress" ON public.growth_progress;
CREATE POLICY "Users manage own growth progress" ON public.growth_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 6: CREATE POLICIES FOR GARDENER_INTERACTIONS
-- ============================================

DROP POLICY IF EXISTS "Users manage own gardener interactions" ON public.gardener_interactions;
CREATE POLICY "Users manage own gardener interactions" ON public.gardener_interactions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 7: CREATE POLICIES FOR MESSAGE_REACTIONS
-- ============================================

DROP POLICY IF EXISTS "Users can react to messages in their conversations" ON public.message_reactions;
CREATE POLICY "Users can react to messages in their conversations" ON public.message_reactions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversations c ON c.id = m.conversation_id
      JOIN public.matches ma ON ma.id = c.match_id
      WHERE m.id = message_reactions.message_id
      AND (ma.user1_id = auth.uid() OR ma.user2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversations c ON c.id = m.conversation_id
      JOIN public.matches ma ON ma.id = c.match_id
      WHERE m.id = message_reactions.message_id
      AND (ma.user1_id = auth.uid() OR ma.user2_id = auth.uid())
    )
  );

-- ============================================
-- PART 8: CREATE POLICIES FOR USER_ACTIVITIES
-- ============================================

DROP POLICY IF EXISTS "Users manage own activities" ON public.user_activities;
CREATE POLICY "Users manage own activities" ON public.user_activities
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 9: CREATE POLICIES FOR MATCH_SCORES
-- ============================================

DROP POLICY IF EXISTS "Users can view their match scores" ON public.match_scores;
CREATE POLICY "Users can view their match scores" ON public.match_scores
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_scores.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "System can insert match scores" ON public.match_scores;
CREATE POLICY "System can insert match scores" ON public.match_scores
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_scores.match_id
      AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
    )
  );

-- ============================================
-- PART 10: CREATE POLICIES FOR USER_HOBBIES
-- ============================================

DROP POLICY IF EXISTS "Users manage own hobbies" ON public.user_hobbies;
CREATE POLICY "Users manage own hobbies" ON public.user_hobbies
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PART 11: CREATE POLICIES FOR USER_REWARDS
-- ============================================

DROP POLICY IF EXISTS "Users manage own rewards" ON public.user_rewards;
CREATE POLICY "Users manage own rewards" ON public.user_rewards
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================

-- Uncomment to verify RLS is enabled on all tables:
/*
SELECT
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'photos', 'user_preferences', 'user_blocks', 'user_reports',
  'growth_progress', 'gardener_interactions', 'message_reactions',
  'user_activities', 'match_scores', 'user_hobbies', 'user_rewards'
)
ORDER BY tablename;
*/

-- Uncomment to verify policies exist:
/*
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'photos', 'user_preferences', 'user_blocks', 'user_reports',
  'growth_progress', 'gardener_interactions', 'message_reactions',
  'user_activities', 'match_scores', 'user_hobbies', 'user_rewards'
)
GROUP BY tablename
ORDER BY tablename;
*/
