-- Add sexual_orientation column to users table
-- This fixes the data collision bug where sexual-orientation.tsx was overwriting
-- the preferences field that is also used by preferences.tsx

-- Add the sexual_orientation column
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS sexual_orientation TEXT;

-- Add a comment to document what this field stores
COMMENT ON COLUMN users.sexual_orientation IS 'User sexual orientation: Straight, Gay, Lesbian, Bisexual, Pansexual, Asexual, Queer, Questioning';

-- Create an index for potential filtering/matching
CREATE INDEX IF NOT EXISTS idx_users_sexual_orientation ON users(sexual_orientation);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'sexual_orientation';
