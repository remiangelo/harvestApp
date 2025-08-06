-- SIMPLE RLS FIX - Works with all PostgreSQL versions
-- Run this entire script in your Supabase SQL editor

-- 1. Temporarily disable RLS to clean up
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'users'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON users';
    END LOOP;
END $$;

-- 3. Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, working policies

-- Allow users to insert their own profile
CREATE POLICY "auth_users_insert_own" ON users
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to select their own profile
CREATE POLICY "auth_users_select_own" ON users
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "auth_users_update_own" ON users
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to view other profiles for discovery
CREATE POLICY "auth_users_select_others" ON users
FOR SELECT TO authenticated
USING (auth.uid() != id);

-- 5. Grant permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO anon;
GRANT ALL ON users TO service_role;

-- 6. Test - this should show your 4 policies
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- 7. Test - this should show rowsecurity = true
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';

-- Done! Try signing up again.