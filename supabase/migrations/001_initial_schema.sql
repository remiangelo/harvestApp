-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For location-based features

-- Create custom types
CREATE TYPE gender_type AS ENUM ('male', 'female', 'non-binary', 'prefer-not-to-say');
CREATE TYPE sexual_identity_type AS ENUM ('straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other');
CREATE TYPE relationship_goal_type AS ENUM ('long-term', 'short-term', 'casual', 'friendship', 'unsure');
CREATE TYPE swipe_type AS ENUM ('like', 'nope', 'super_like');

-- Enhanced Users table with better indexing
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  first_name TEXT NOT NULL,
  bio TEXT,
  age INTEGER CHECK (age >= 18 AND age <= 100),
  gender gender_type,
  sexual_identity sexual_identity_type,
  location GEOGRAPHY(POINT),
  city TEXT,
  max_distance INTEGER DEFAULT 50 CHECK (max_distance > 0 AND max_distance <= 500),
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_users_location ON users USING GIST (location);
CREATE INDEX idx_users_age ON users (age);
CREATE INDEX idx_users_last_active ON users (last_active);
CREATE INDEX idx_users_is_active ON users (is_active);

-- User preferences with better structure
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  min_age INTEGER CHECK (min_age >= 18) DEFAULT 18,
  max_age INTEGER CHECK (max_age <= 100) DEFAULT 100,
  interested_in gender_type[],
  relationship_goals relationship_goal_type[],
  max_distance INTEGER DEFAULT 50,
  show_me_in_searches BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT age_range_check CHECK (min_age <= max_age)
);

-- Photos with better metadata
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraints
ALTER TABLE photos ADD CONSTRAINT unique_user_order UNIQUE (user_id, order_index);
ALTER TABLE photos ADD CONSTRAINT one_primary_per_user EXCLUDE (user_id WITH =) WHERE (is_primary = true);

-- Hobbies/Interests with categories
CREATE TABLE user_hobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hobby TEXT NOT NULL,
  category TEXT, -- Sports, Arts, Music, Travel, Food, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_hobbies ADD CONSTRAINT unique_user_hobby UNIQUE (user_id, hobby);

-- Enhanced Swipes table with metadata
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID REFERENCES users(id) ON DELETE CASCADE,
  swiped_id UUID REFERENCES users(id) ON DELETE CASCADE,
  swipe_type swipe_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT no_self_swipe CHECK (swiper_id != swiped_id),
  UNIQUE(swiper_id, swiped_id)
);

CREATE INDEX idx_swipes_swiper ON swipes (swiper_id);
CREATE INDEX idx_swipes_swiped ON swipes (swiped_id);
CREATE INDEX idx_swipes_created ON swipes (created_at);

-- Matches table with better tracking
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unmatched_at TIMESTAMP WITH TIME ZONE,
  unmatched_by UUID REFERENCES users(id),
  CONSTRAINT different_users CHECK (user1_id != user2_id),
  CONSTRAINT ordered_users CHECK (user1_id < user2_id), -- Ensure consistent ordering
  UNIQUE(user1_id, user2_id)
);

CREATE INDEX idx_matches_users ON matches (user1_id, user2_id);
CREATE INDEX idx_matches_active ON matches (is_active);

-- Match quality scoring
CREATE TABLE match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE UNIQUE,
  compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  interests_score INTEGER CHECK (interests_score >= 0 AND interests_score <= 100),
  personality_score INTEGER CHECK (personality_score >= 0 AND personality_score <= 100),
  common_interests INTEGER DEFAULT 0,
  distance_km DECIMAL(10, 2),
  age_compatibility INTEGER,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE UNIQUE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_preview TEXT,
  unread_count_user1 INTEGER DEFAULT 0,
  unread_count_user2 INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Advanced messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'emoji', 'gif')),
  media_url TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id);
CREATE INDEX idx_messages_created ON messages (created_at);

-- Message reactions
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL, -- heart, laugh, wow, sad, angry
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- User reports/blocking
CREATE TABLE user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User blocking
CREATE TABLE user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(blocker_id, blocked_id)
);

-- User activity tracking for analytics
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- login, swipe, message, profile_view, etc.
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activities_user ON user_activities (user_id);
CREATE INDEX idx_activities_type ON user_activities (activity_type);
CREATE INDEX idx_activities_created ON user_activities (created_at);

-- Gardener AI interactions (unique feature)
CREATE TABLE gardener_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- lesson, intervention, chat
  lesson_id TEXT,
  content TEXT,
  user_response TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Growth opportunities progress (unique feature)
CREATE TABLE growth_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  unit_number INTEGER,
  lesson_number INTEGER,
  is_completed BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  coins_earned INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, lesson_id)
);

-- User coins/rewards system
CREATE TABLE user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_coins INTEGER DEFAULT 0,
  coins_spent INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_rewards_updated_at BEFORE UPDATE ON user_rewards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gardener_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (to be expanded based on auth strategy)
-- Users can read their own data
CREATE POLICY users_read_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update_own ON users FOR UPDATE USING (auth.uid() = id);

-- Users can manage their own preferences
CREATE POLICY preferences_manage_own ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own photos
CREATE POLICY photos_manage_own ON photos FOR ALL USING (auth.uid() = user_id);

-- Add more policies as needed...