-- Quick fix for the current schema issues
-- Run this in your Supabase SQL editor

-- First, check if your users table has the old schema
-- If it does, we need to migrate it to the new schema

-- Drop columns from the original schema that we don't use
ALTER TABLE users 
  DROP COLUMN IF EXISTS first_name CASCADE,
  DROP COLUMN IF EXISTS phone CASCADE,
  DROP COLUMN IF EXISTS sexual_identity CASCADE,
  DROP COLUMN IF EXISTS is_verified CASCADE,
  DROP COLUMN IF EXISTS is_active CASCADE,
  DROP COLUMN IF EXISTS last_active CASCADE;

-- Drop the geography column if it exists (we use text for location)
ALTER TABLE users DROP COLUMN IF EXISTS location CASCADE;
  
-- Add columns that our app actually uses
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS nickname TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT, -- City, State format
  ADD COLUMN IF NOT EXISTS preferences TEXT, -- Sexual orientation preference  
  ADD COLUMN IF NOT EXISTS goals TEXT, -- Dating, Relationship, Marriage
  ADD COLUMN IF NOT EXISTS photos TEXT[], -- Array of photo URLs
  ADD COLUMN IF NOT EXISTS hobbies TEXT[], -- Array of hobbies
  ADD COLUMN IF NOT EXISTS distance_preference INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Ensure gender is TEXT not an enum
DO $$ 
BEGIN
  -- Check if gender column exists and is an enum
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'gender' 
    AND data_type = 'USER-DEFINED'
  ) THEN
    -- Drop the enum column
    ALTER TABLE users DROP COLUMN gender CASCADE;
  END IF;
END $$;

-- Add gender as TEXT
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT;

-- Ensure max_distance exists (some code refers to it)
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_distance INTEGER DEFAULT 50;

-- Drop old indexes that might cause issues
DROP INDEX IF EXISTS idx_users_location;
DROP INDEX IF EXISTS idx_users_last_active;
DROP INDEX IF EXISTS idx_users_is_active;

-- Create useful indexes
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);

-- Make sure the auth.users id can be used
ALTER TABLE users 
  ALTER COLUMN id DROP DEFAULT;

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create a policy that allows users to update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create a policy that allows users to insert their own data
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON users TO service_role;

-- Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;