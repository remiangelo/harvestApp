-- Migration: Add interested_in column to users table
-- This column stores the user's preference for who they want to match with
-- Needed for the streamlined onboarding flow

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS interested_in TEXT[];

-- Add index for filtering by interested_in preferences
CREATE INDEX IF NOT EXISTS idx_users_interested_in ON users USING GIN(interested_in);

COMMENT ON COLUMN users.interested_in IS 'Array of gender preferences for matching (Men, Women, Non-binary, Everyone)';
