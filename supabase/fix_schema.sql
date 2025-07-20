-- Run this SQL in your Supabase SQL editor to fix the schema issues

-- Add missing columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS nickname TEXT,
ADD COLUMN IF NOT EXISTS photos TEXT[],
ADD COLUMN IF NOT EXISTS hobbies TEXT[];

-- You can also run the full migration to add all missing columns:
-- Run the contents of migrations/003_users_table_updates.sql in your Supabase SQL editor