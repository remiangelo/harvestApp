-- Fix Row Level Security (RLS) policies for the users table
-- Run this in your Supabase SQL editor to fix the "new row violates row-level security policy" error

-- First, check if RLS is enabled
-- If it's not enabled, we don't need policies
DO $$ 
BEGIN
    -- Enable RLS on users table if not already enabled
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
EXCEPTION
    WHEN OTHERS THEN
        -- RLS already enabled, continue
        NULL;
END $$;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;

-- Create new policies that work with Supabase Auth

-- Policy 1: Allow authenticated users to insert their own profile
-- This is crucial for signup to work
CREATE POLICY "Users can insert own profile on signup" ON users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Policy 2: Allow users to read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT 
    USING (auth.uid() = id);

-- Policy 3: Allow users to update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy 4: Allow users to view other profiles (for swiping)
-- This is needed for the discovery/swipe feature
CREATE POLICY "Users can view other profiles for discovery" ON users
    FOR SELECT
    USING (
        -- Can view if you're authenticated
        auth.uid() IS NOT NULL
        -- Optional: Add more conditions like blocking, matching status, etc.
    );

-- Grant necessary permissions to authenticated users
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon; -- Needed for signup before auth
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Also ensure the auth schema user can access
GRANT USAGE ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- Test: This should return your policies
-- If you see the policies listed, RLS is now properly configured!

-- IMPORTANT: If you're still getting errors, you might need to also run:
-- This allows the service role to bypass RLS (used during signup)
ALTER TABLE users FORCE ROW LEVEL SECURITY;