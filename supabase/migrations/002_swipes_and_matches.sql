-- Create swipes table to track all swipe actions
CREATE TABLE IF NOT EXISTS swipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  swiper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  swiped_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('like', 'nope', 'super_like')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure a user can only swipe once on a profile
  UNIQUE(swiper_id, swiped_id)
);

-- Create matches table for mutual likes
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  unmatched_at TIMESTAMP WITH TIME ZONE,
  unmatched_by UUID REFERENCES auth.users(id),
  
  -- Ensure unique matches (user1_id should always be < user2_id)
  CONSTRAINT unique_match UNIQUE(user1_id, user2_id),
  CONSTRAINT ordered_users CHECK (user1_id < user2_id)
);

-- Create indexes for performance
CREATE INDEX idx_swipes_swiper_id ON swipes(swiper_id);
CREATE INDEX idx_swipes_swiped_id ON swipes(swiped_id);
CREATE INDEX idx_swipes_created_at ON swipes(created_at DESC);
CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_matches_is_active ON matches(is_active);

-- Function to check and create match after a like
CREATE OR REPLACE FUNCTION check_and_create_match()
RETURNS TRIGGER AS $$
DECLARE
  reciprocal_swipe_exists BOOLEAN;
  ordered_user1 UUID;
  ordered_user2 UUID;
BEGIN
  -- Only process likes and superlikes
  IF NEW.action NOT IN ('like', 'super_like') THEN
    RETURN NEW;
  END IF;

  -- Check if the other user has liked this user
  SELECT EXISTS (
    SELECT 1 FROM swipes
    WHERE swiper_id = NEW.swiped_id
    AND swiped_id = NEW.swiper_id
    AND action IN ('like', 'super_like')
  ) INTO reciprocal_swipe_exists;

  IF reciprocal_swipe_exists THEN
    -- Order user IDs to ensure consistency
    IF NEW.swiper_id < NEW.swiped_id THEN
      ordered_user1 := NEW.swiper_id;
      ordered_user2 := NEW.swiped_id;
    ELSE
      ordered_user1 := NEW.swiped_id;
      ordered_user2 := NEW.swiper_id;
    END IF;

    -- Insert match if it doesn't exist
    INSERT INTO matches (user1_id, user2_id)
    VALUES (ordered_user1, ordered_user2)
    ON CONFLICT (user1_id, user2_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create matches
CREATE TRIGGER trigger_check_match
AFTER INSERT ON swipes
FOR EACH ROW
EXECUTE FUNCTION check_and_create_match();

-- RLS Policies for swipes
ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;

-- Users can only create swipes for themselves
CREATE POLICY "Users can create their own swipes" ON swipes
  FOR INSERT WITH CHECK (auth.uid() = swiper_id);

-- Users can view their own swipes
CREATE POLICY "Users can view their own swipes" ON swipes
  FOR SELECT USING (auth.uid() = swiper_id);

-- RLS Policies for matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Users can view matches where they are involved
CREATE POLICY "Users can view their matches" ON matches
  FOR SELECT USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Users can update matches they're involved in (for unmatching)
CREATE POLICY "Users can unmatch" ON matches
  FOR UPDATE USING (
    auth.uid() = user1_id OR auth.uid() = user2_id
  );

-- Function to check match status between two users
CREATE OR REPLACE FUNCTION get_match_status(user_a UUID, user_b UUID)
RETURNS TABLE(is_matched BOOLEAN, match_id UUID) AS $$
DECLARE
  ordered_user1 UUID;
  ordered_user2 UUID;
BEGIN
  -- Order user IDs to match the constraint
  IF user_a < user_b THEN
    ordered_user1 := user_a;
    ordered_user2 := user_b;
  ELSE
    ordered_user1 := user_b;
    ordered_user2 := user_a;
  END IF;

  RETURN QUERY
  SELECT 
    TRUE as is_matched,
    id as match_id
  FROM matches
  WHERE user1_id = ordered_user1
    AND user2_id = ordered_user2
    AND is_active = TRUE
  LIMIT 1;
  
  -- If no match found, return false
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE::BOOLEAN as is_matched, NULL::UUID as match_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;