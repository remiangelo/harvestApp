-- Cleanup Duplicate RLS Policies
-- This script removes old/duplicate policies and keeps only the correct ones
-- Safe to run multiple times (idempotent)

-- ============================================================================
-- STEP 1: Drop ALL existing policies (including duplicates)
-- ============================================================================

-- Drop old/duplicate policies (public role - redundant)
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile on signup" ON public.users;
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view other profiles for discovery" ON public.users; -- DANGEROUS - allows viewing ALL users

-- Drop the correct policies (will recreate them)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view other profiles for matching" ON public.users;

-- ============================================================================
-- STEP 2: Recreate ONLY the 4 correct policies (authenticated role)
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
  -- Users can ONLY see completed profiles that aren't their own
  onboarding_completed = true
  AND id != auth.uid()
);

-- ============================================================================
-- STEP 3: Verify exactly 4 policies exist (all targeting 'authenticated')
-- ============================================================================
SELECT
  policyname,
  roles,
  cmd,
  CASE
    WHEN qual IS NULL THEN 'N/A'
    ELSE qual
  END as qual,
  CASE
    WHEN with_check IS NULL THEN 'N/A'
    ELSE with_check
  END as with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
ORDER BY cmd, policyname;

-- Expected output: Exactly 4 rows, all with roles = '{authenticated}'
-- 1. INSERT - "Users can insert their own profile" - with_check: (auth.uid() = id)
-- 2. SELECT - "Users can view their own profile" - qual: (auth.uid() = id)
-- 3. SELECT - "Users can view other profiles for matching" - qual: ((onboarding_completed = true) AND (id <> auth.uid()))
-- 4. UPDATE - "Users can update their own profile" - qual: (auth.uid() = id), with_check: (auth.uid() = id)

-- ============================================================================
-- STEP 4: Security verification - ensure no public role policies exist
-- ============================================================================
SELECT COUNT(*) as public_policies_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
  AND 'public' = ANY(roles);

-- Expected output: 0 (no public role policies should exist)

-- ============================================================================
-- SUCCESS CRITERIA
-- ============================================================================
-- ✅ Exactly 4 policies exist
-- ✅ All 4 policies target 'authenticated' role (NOT 'public')
-- ✅ No policy has qual = 'true' (would allow unrestricted access)
-- ✅ INSERT/UPDATE policies check auth.uid() = id
-- ✅ SELECT policies properly scope access (own profile + completed profiles only)
