-- RLS Policy Verification and Fix Script
-- Run this in Supabase SQL Editor to ensure proper RLS policies exist

-- ============================================================================
-- STEP 1: Verify RLS is enabled on users table
-- ============================================================================
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';
-- Expected: rowsecurity = true

-- ============================================================================
-- STEP 2: Drop existing policies to prevent conflicts (safe to run multiple times)
-- ============================================================================
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view other profiles for matching" ON public.users;

-- ============================================================================
-- STEP 3: Create required RLS policies
-- ============================================================================

-- Policy 1: Users can INSERT their own profile
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy 2: Users can UPDATE their own profile
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Users can SELECT/view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 4: Users can view OTHER profiles for matching (discovery feed)
CREATE POLICY "Users can view other profiles for matching"
ON public.users
FOR SELECT
TO authenticated
USING (
  -- Users can see completed profiles that aren't their own
  onboarding_completed = true
  AND id != auth.uid()
);

-- ============================================================================
-- STEP 4: Verify policies were created correctly
-- ============================================================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
ORDER BY policyname;

-- Expected output: 4 policies listed above

-- ============================================================================
-- STEP 5: Test policies with a sample query (optional)
-- ============================================================================
-- This should return your own profile if you're logged in
-- SELECT * FROM users WHERE id = auth.uid();

-- ============================================================================
-- SUCCESS CRITERIA
-- ============================================================================
-- ✅ RLS is enabled on users table (rowsecurity = true)
-- ✅ 4 policies exist: insert, update, select (own), select (others)
-- ✅ All policies target 'authenticated' role
-- ✅ INSERT/UPDATE policies check auth.uid() = id
-- ✅ SELECT policies allow viewing own profile + completed profiles for matching
