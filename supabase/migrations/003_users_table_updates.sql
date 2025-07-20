-- Migration: Update users table to match our implementation
-- Run this after 002_matching_system.sql

-- First, drop the old constraints and columns that don't match our implementation
ALTER TABLE users 
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS phone,
  DROP COLUMN IF EXISTS gender,
  DROP COLUMN IF EXISTS sexual_identity,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS max_distance,
  DROP COLUMN IF EXISTS is_verified,
  DROP COLUMN IF EXISTS is_active,
  DROP COLUMN IF EXISTS last_active;

-- Add columns that match our onboarding flow
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS nickname TEXT,
  ADD COLUMN IF NOT EXISTS preferences TEXT, -- Sexual orientation preference
  ADD COLUMN IF NOT EXISTS goals TEXT, -- Dating, Relationship, Marriage
  ADD COLUMN IF NOT EXISTS gender TEXT, -- User's gender
  ADD COLUMN IF NOT EXISTS location TEXT, -- City, State format
  ADD COLUMN IF NOT EXISTS photos TEXT[], -- Array of photo URLs
  ADD COLUMN IF NOT EXISTS hobbies TEXT[], -- Array of hobbies
  ADD COLUMN IF NOT EXISTS distance_preference INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Update indexes
DROP INDEX IF EXISTS idx_users_location;
DROP INDEX IF EXISTS idx_users_last_active;
DROP INDEX IF EXISTS idx_users_is_active;

-- Add new indexes
CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_users_preferences ON users(preferences);
CREATE INDEX IF NOT EXISTS idx_users_goals ON users(goals);

-- Update user_preferences table to match
ALTER TABLE user_preferences
  DROP COLUMN IF EXISTS interested_in,
  DROP COLUMN IF EXISTS relationship_goals,
  DROP COLUMN IF EXISTS show_me_in_searches;

-- Function to get users for discovery feed
CREATE OR REPLACE FUNCTION get_discovery_profiles(
  user_id UUID,
  user_preferences TEXT,
  user_distance INTEGER DEFAULT 50,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  nickname TEXT,
  age INTEGER,
  bio TEXT,
  location TEXT,
  gender TEXT,
  preferences TEXT,
  goals TEXT,
  hobbies TEXT[],
  photos TEXT[],
  distance_preference INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.nickname,
    u.age,
    u.bio,
    u.location,
    u.gender,
    u.preferences,
    u.goals,
    u.hobbies,
    u.photos,
    u.distance_preference
  FROM users u
  WHERE u.id != user_id -- Don't show self
    AND u.onboarding_completed = true -- Only completed profiles
    AND u.id NOT IN ( -- Don't show already swiped profiles
      SELECT swiped_id FROM swipes WHERE swiper_id = user_id
    )
    AND (
      -- Match sexual preferences (simplified for now)
      (user_preferences = 'Straight' AND u.gender != (SELECT gender FROM users WHERE id = user_id))
      OR (user_preferences IN ('Gay', 'Lesbian') AND u.gender = (SELECT gender FROM users WHERE id = user_id))
      OR (user_preferences IN ('Bisexual', 'Pansexual'))
    )
  ORDER BY u.created_at DESC -- Newest users first for now
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get match details with user info
CREATE OR REPLACE FUNCTION get_user_matches(user_id UUID)
RETURNS TABLE (
  match_id UUID,
  matched_user_id UUID,
  matched_at TIMESTAMP WITH TIME ZONE,
  last_interaction TIMESTAMP WITH TIME ZONE,
  unread_count BIGINT,
  nickname TEXT,
  age INTEGER,
  bio TEXT,
  photos TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as match_id,
    CASE 
      WHEN m.user1_id = user_id THEN m.user2_id
      ELSE m.user1_id
    END as matched_user_id,
    m.matched_at,
    m.last_interaction,
    COUNT(msg.id) FILTER (WHERE msg.is_read = false AND msg.sender_id != user_id) as unread_count,
    u.nickname,
    u.age,
    u.bio,
    u.photos
  FROM matches m
  JOIN users u ON u.id = CASE 
    WHEN m.user1_id = user_id THEN m.user2_id
    ELSE m.user1_id
  END
  LEFT JOIN messages msg ON msg.match_id = m.id
  WHERE (m.user1_id = user_id OR m.user2_id = user_id)
    AND ((m.user1_id = user_id AND m.user1_unmatched = false) 
      OR (m.user2_id = user_id AND m.user2_unmatched = false))
  GROUP BY m.id, m.user1_id, m.user2_id, m.matched_at, m.last_interaction, 
           u.nickname, u.age, u.bio, u.photos
  ORDER BY m.last_interaction DESC;
END;
$$ LANGUAGE plpgsql;