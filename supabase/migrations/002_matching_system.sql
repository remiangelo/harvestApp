-- Migration: Add matching system tables
-- Run this after 001_initial_schema.sql

-- Swipes table to track all swipe actions
CREATE TABLE IF NOT EXISTS swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  swiped_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action swipe_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure a user can only swipe once on another user
  CONSTRAINT unique_swipe UNIQUE(swiper_id, swiped_id),
  -- Prevent self-swiping
  CONSTRAINT no_self_swipe CHECK (swiper_id != swiped_id)
);

-- Indexes for performance
CREATE INDEX idx_swipes_swiper ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped ON swipes(swiped_id);
CREATE INDEX idx_swipes_created ON swipes(created_at DESC);

-- Matches table for mutual likes
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user1_unmatched BOOLEAN DEFAULT false,
  user2_unmatched BOOLEAN DEFAULT false,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique matches (order doesn't matter)
  CONSTRAINT unique_match UNIQUE(user1_id, user2_id),
  -- Ensure user1_id is always less than user2_id for consistency
  CONSTRAINT ordered_users CHECK (user1_id < user2_id)
);

-- Indexes for matches
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_active ON matches(user1_unmatched, user2_unmatched);

-- Messages table for chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for messages
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_unread ON messages(match_id, is_read) WHERE is_read = false;

-- Profile view tracking (for analytics)
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Track unique daily views
  CONSTRAINT unique_daily_view UNIQUE(viewer_id, viewed_id, DATE(viewed_at))
);

-- Indexes for profile views
CREATE INDEX idx_profile_views_viewer ON profile_views(viewer_id);
CREATE INDEX idx_profile_views_viewed ON profile_views(viewed_id);
CREATE INDEX idx_profile_views_date ON profile_views(viewed_at);

-- Function to automatically create a match when mutual like occurs
CREATE OR REPLACE FUNCTION check_mutual_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check for likes and super_likes
  IF NEW.action IN ('like', 'super_like') THEN
    -- Check if the other person has already liked this user
    IF EXISTS (
      SELECT 1 FROM swipes 
      WHERE swiper_id = NEW.swiped_id 
      AND swiped_id = NEW.swiper_id 
      AND action IN ('like', 'super_like')
    ) THEN
      -- Create a match with ordered IDs
      INSERT INTO matches (user1_id, user2_id)
      VALUES (
        LEAST(NEW.swiper_id, NEW.swiped_id),
        GREATEST(NEW.swiper_id, NEW.swiped_id)
      )
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic matching
CREATE TRIGGER trigger_check_mutual_match
AFTER INSERT ON swipes
FOR EACH ROW
EXECUTE FUNCTION check_mutual_match();

-- Function to get match status between two users
CREATE OR REPLACE FUNCTION get_match_status(user_a UUID, user_b UUID)
RETURNS TABLE (
  is_matched BOOLEAN,
  match_id UUID,
  matched_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    true as is_matched,
    m.id as match_id,
    m.matched_at
  FROM matches m
  WHERE (m.user1_id = LEAST(user_a, user_b) AND m.user2_id = GREATEST(user_a, user_b))
    AND m.user1_unmatched = false 
    AND m.user2_unmatched = false;
END;
$$ LANGUAGE plpgsql;

-- Update last_interaction timestamp when message is sent
CREATE OR REPLACE FUNCTION update_match_interaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE matches 
  SET last_interaction = NOW()
  WHERE id = NEW.match_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_match_interaction
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_match_interaction();

-- RLS Policies for swipes
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own swipes" ON swipes
  FOR INSERT WITH CHECK (auth.uid() = swiper_id);

CREATE POLICY "Users can view their own swipes" ON swipes
  FOR SELECT USING (auth.uid() = swiper_id);

-- RLS Policies for matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

CREATE POLICY "Users can update their own match status" ON matches
  FOR UPDATE USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- RLS Policies for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can send messages in their matches" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
      AND sender_id = auth.uid()
    )
  );

CREATE POLICY "Users can view messages in their matches" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches m
      WHERE m.id = match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());