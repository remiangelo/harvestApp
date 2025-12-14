-- Migration: Fix search_path on all database functions
-- Created: 2025-01-25
-- Purpose: Prevent SQL injection via schema manipulation
-- Fixes: 12 functions with mutable search_path

-- ============================================
-- APPROACH: Add SET search_path to function definitions
-- ============================================
-- This migration adds "SET search_path = public, extensions" to all functions
-- to prevent attackers from creating malicious schemas that override auth/core schemas

-- ============================================
-- PART 1: FIX TRIGGER FUNCTIONS (4 functions)
-- ============================================

-- Function: update_updated_at_column
-- Purpose: Auto-update updated_at timestamp on row changes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: update_user_safety_settings_timestamp
-- Purpose: Auto-update user_safety_settings.updated_at
CREATE OR REPLACE FUNCTION public.update_user_safety_settings_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: update_user_values_sought_updated_at
-- Purpose: Auto-update user_values_sought.updated_at
CREATE OR REPLACE FUNCTION public.update_user_values_sought_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: update_user_values_brought_updated_at
-- Purpose: Auto-update user_values_brought.updated_at
CREATE OR REPLACE FUNCTION public.update_user_values_brought_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================
-- PART 2: NOTE ON REMAINING 8 FUNCTIONS
-- ============================================

/*
The following 8 functions require their full definitions from the database
to properly recreate them with SET search_path:

1. check_and_create_match
2. get_discovery_profiles
3. get_match_status
4. check_mutual_match
5. get_user_quiz_history
6. update_match_interaction
7. get_user_matches
8. update_user_insights_from_quiz

MANUAL STEP REQUIRED:
To fix these functions, you need to:

1. Get each function definition from Supabase SQL Editor:
   SELECT pg_get_functiondef(oid)
   FROM pg_proc
   WHERE proname = 'function_name';

2. Copy the output

3. Add this line after LANGUAGE declaration:
   SET search_path = public, extensions

4. Run the CREATE OR REPLACE FUNCTION statement

Example:
  CREATE OR REPLACE FUNCTION public.check_and_create_match(...)
  RETURNS ...
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public, extensions  <-- ADD THIS LINE
  AS $$
  BEGIN
    ... (rest of function body)
  END;
  $$;

ALTERNATIVE: Run this query in Supabase SQL Editor to fix all at once:
*/

-- This will generate ALTER FUNCTION statements for all affected functions
-- Copy the output and run each statement

/*
SELECT
  'ALTER FUNCTION ' ||
  n.nspname || '.' ||
  p.proname || '(' ||
  pg_get_function_identity_arguments(p.oid) || ') ' ||
  'SET search_path = public, extensions;' as fix_statement
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
  'update_user_insights_from_quiz'
)
ORDER BY p.proname;
*/

-- ============================================
-- QUICK FIX: Use ALTER FUNCTION (PostgreSQL 14+)
-- ============================================

-- This approach modifies existing functions without recreating them
-- Safer but may not work if functions don't exist yet

DO $$
DECLARE
  func_name TEXT;
  func_args TEXT;
BEGIN
  -- Get function signatures and apply SET search_path
  FOR func_name, func_args IN
    SELECT
      p.proname,
      pg_get_function_identity_arguments(p.oid)
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
      'update_user_insights_from_quiz'
    )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION public.%I(%s) SET search_path = public, extensions',
      func_name,
      func_args
    );
    RAISE NOTICE 'Fixed function: %', func_name;
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error fixing functions: %', SQLERRM;
    RAISE NOTICE 'You may need to manually fix functions - see comments above';
END;
$$;

-- ============================================
-- VERIFICATION QUERIES (Run after migration)
-- ============================================

-- Uncomment to verify search_path is set on all functions:
/*
SELECT
  n.nspname as schema,
  p.proname as function_name,
  CASE
    WHEN p.proconfig IS NOT NULL THEN 'search_path configured'
    ELSE 'NO search_path (VULNERABLE)'
  END as security_status,
  p.proconfig as configuration
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
*/
