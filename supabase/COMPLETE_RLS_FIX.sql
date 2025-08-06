-- COMPLETE FIX for Row Level Security (RLS) error during signup
-- Run ALL of this in your Supabase SQL editor

-- 1. First, temporarily disable RLS to clean up
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can insert own profile on signup" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view other profiles for discovery" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;

-- 3. Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Create the correct policies

-- CRITICAL: This policy allows users to create their profile during signup
CREATE POLICY "Enable insert during signup" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow authenticated users to view other profiles (for swiping)
CREATE POLICY "Users can view profiles for discovery" ON users
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND id != auth.uid()  -- Can't view own profile with this policy (use above policy for that)
        AND onboarding_completed = true  -- Only view completed profiles
    );

-- 5. Grant proper permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;

-- 6. IMPORTANT: Grant permissions to service_role for internal operations
GRANT ALL ON users TO service_role;

-- 7. Ensure the table is accessible
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- 8. Force RLS (skip if not supported in your PostgreSQL version)
-- Note: FORCE ROW LEVEL SECURITY is only available in PostgreSQL 15+
-- If you get an error here, just comment out this line
-- ALTER TABLE users FORCE ROW LEVEL SECURITY;

-- 9. Verify the setup
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- You should see 4 policies listed

-- 10. Test the configuration
-- This query will help verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- rowsecurity should be 'true'

-- If you're STILL getting errors after running this, try:
-- 1. Check that your Supabase Anon Key is in your .env file
-- 2. Make sure you're using the Anon Key, not the Service Role Key in your app
-- 3. Clear your browser cache / app data and try again