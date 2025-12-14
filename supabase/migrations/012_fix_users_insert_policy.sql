-- Migration: Fix missing INSERT policy for users table
-- Created: 2025-01-29
-- Purpose: Add INSERT policy to allow UPSERT operations during onboarding
-- Fixes: Onboarding crash due to RLS blocking profile creation

-- ============================================
-- ADD INSERT POLICY FOR USERS TABLE
-- ============================================

-- Drop existing policy if it exists (in case of re-run)
DROP POLICY IF EXISTS "users_insert_own" ON public.users;

-- Create INSERT policy allowing authenticated users to insert their own profile
CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- VERIFICATION QUERY (Run after migration)
-- ============================================

-- Uncomment to verify all policies exist:
/*
SELECT
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'users'
ORDER BY cmd, policyname;
*/

-- Expected output should show:
-- 1. users_insert_own (INSERT)
-- 2. users_read_own (SELECT)
-- 3. users_update_own (UPDATE)
