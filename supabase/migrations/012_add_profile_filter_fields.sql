-- Migration: Add Profile Filter Fields
-- Description: Adds new fields for enhanced profile filtering
-- Created: 2026-01-01

-- Add new columns to users table for filtering
ALTER TABLE users
  -- Premium tier filters (Looking for, Height, Lifestyle)
  ADD COLUMN IF NOT EXISTS looking_for TEXT CHECK (looking_for IN ('dating', 'relationship', 'marriage')),
  ADD COLUMN IF NOT EXISTS height_cm INTEGER CHECK (height_cm >= 100 AND height_cm <= 250),
  ADD COLUMN IF NOT EXISTS smoking TEXT CHECK (smoking IN ('never', 'sometimes', 'regularly', 'prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS drinking TEXT CHECK (drinking IN ('never', 'socially', 'regularly', 'prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS cannabis TEXT CHECK (cannabis IN ('never', 'sometimes', 'regularly', 'prefer_not_to_say')),

  -- Gold tier filters (Spiritual/Faith, Children)
  ADD COLUMN IF NOT EXISTS spiritual_orientation TEXT CHECK (spiritual_orientation IN (
    'spiritual_not_religious',
    'christian',
    'catholic',
    'jewish',
    'muslim',
    'hindu',
    'buddhist',
    'atheist',
    'agnostic',
    'other',
    'prefer_not_to_say'
  )),
  ADD COLUMN IF NOT EXISTS children_status TEXT CHECK (children_status IN (
    'have_and_want_more',
    'have_and_dont_want_more',
    'want_kids',
    'open_to_kids',
    'dont_want_kids',
    'prefer_not_to_say'
  ));

-- Add indexes for filtering performance
CREATE INDEX IF NOT EXISTS idx_users_looking_for ON users(looking_for) WHERE looking_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_height_cm ON users(height_cm) WHERE height_cm IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_smoking ON users(smoking) WHERE smoking IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_drinking ON users(drinking) WHERE drinking IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_cannabis ON users(cannabis) WHERE cannabis IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_spiritual_orientation ON users(spiritual_orientation) WHERE spiritual_orientation IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_children_status ON users(children_status) WHERE children_status IS NOT NULL;

-- Add comment to document the migration
COMMENT ON COLUMN users.looking_for IS 'What the user is looking for: dating, relationship, or marriage (Premium tier filter)';
COMMENT ON COLUMN users.height_cm IS 'User height in centimeters (Premium tier filter)';
COMMENT ON COLUMN users.smoking IS 'Smoking habits (Premium tier filter)';
COMMENT ON COLUMN users.drinking IS 'Drinking habits (Premium tier filter)';
COMMENT ON COLUMN users.cannabis IS 'Cannabis usage (Premium tier filter)';
COMMENT ON COLUMN users.spiritual_orientation IS 'Spiritual or faith orientation (Gold tier filter)';
COMMENT ON COLUMN users.children_status IS 'Children status and preferences (Gold tier filter)';
