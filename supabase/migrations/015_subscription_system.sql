-- Migration: Subscription System
-- Description: Creates subscription tiers, user subscriptions, and usage tracking
-- Version: 015
-- Date: 2026-01-05

-- =====================================================
-- SUBSCRIPTION TIERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (name IN ('seed', 'green', 'gold')),
  display_name TEXT NOT NULL,
  description TEXT,

  -- Pricing
  price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Feature limits
  matches_per_week INTEGER, -- NULL = unlimited
  max_distance_miles INTEGER, -- NULL = unlimited
  gardener_conversations_per_day INTEGER, -- NULL = unlimited
  gardener_character_limit INTEGER NOT NULL DEFAULT 3000, -- Total chars per conversation

  -- Feature flags
  has_values_matching BOOLEAN NOT NULL DEFAULT false,
  has_basic_filters BOOLEAN NOT NULL DEFAULT true,
  has_advanced_filters BOOLEAN NOT NULL DEFAULT false,
  has_full_filters BOOLEAN NOT NULL DEFAULT false,
  can_see_likes BOOLEAN NOT NULL DEFAULT false,
  can_disable_mindful_messaging BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast tier lookups
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_name ON subscription_tiers(name);
CREATE INDEX IF NOT EXISTS idx_subscription_tiers_active ON subscription_tiers(is_active) WHERE is_active = true;

-- =====================================================
-- USER SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id),

  -- Subscription status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),

  -- Payment info
  payment_provider TEXT CHECK (payment_provider IN ('apple', 'google', 'stripe')),
  payment_id TEXT, -- Store receipt/transaction ID

  -- Dates
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- NULL for free tier
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier ON user_subscriptions(tier_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- =====================================================
-- USER USAGE TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Weekly tracking (resets every Monday)
  week_start_date DATE NOT NULL,
  matches_count INTEGER NOT NULL DEFAULT 0,

  -- Daily Gardener tracking
  gardener_conversations_today INTEGER NOT NULL DEFAULT 0,
  gardener_characters_used_today INTEGER NOT NULL DEFAULT 0,
  gardener_last_reset_date DATE NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one record per user per week
  UNIQUE(user_id, week_start_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_usage_user ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_week ON user_usage(week_start_date);

-- =====================================================
-- INSERT DEFAULT TIERS
-- =====================================================

-- Seed (Free) Tier
INSERT INTO subscription_tiers (
  name, display_name, description,
  price_monthly, price_yearly,
  matches_per_week, max_distance_miles,
  gardener_conversations_per_day, gardener_character_limit,
  has_values_matching, has_basic_filters, has_advanced_filters, has_full_filters,
  can_see_likes, can_disable_mindful_messaging,
  sort_order
) VALUES (
  'seed', '🌱 Seed', 'Free tier - Start your mindful dating journey',
  0, 0,
  5, 100,
  1, 3000, -- 1 conversation, 3000 chars total
  false, true, false, false,
  false, false,
  1
) ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  matches_per_week = EXCLUDED.matches_per_week,
  max_distance_miles = EXCLUDED.max_distance_miles,
  gardener_conversations_per_day = EXCLUDED.gardener_conversations_per_day,
  gardener_character_limit = EXCLUDED.gardener_character_limit,
  has_values_matching = EXCLUDED.has_values_matching,
  has_basic_filters = EXCLUDED.has_basic_filters,
  has_advanced_filters = EXCLUDED.has_advanced_filters,
  has_full_filters = EXCLUDED.has_full_filters,
  can_see_likes = EXCLUDED.can_see_likes,
  can_disable_mindful_messaging = EXCLUDED.can_disable_mindful_messaging,
  sort_order = EXCLUDED.sort_order;

-- Green (Mid) Tier
INSERT INTO subscription_tiers (
  name, display_name, description,
  price_monthly, price_yearly,
  matches_per_week, max_distance_miles,
  gardener_conversations_per_day, gardener_character_limit,
  has_values_matching, has_basic_filters, has_advanced_filters, has_full_filters,
  can_see_likes, can_disable_mindful_messaging,
  sort_order
) VALUES (
  'green', '🟢 Green', 'Mid tier - Unlock unlimited matching and values-based connections',
  9.99, 79.99,
  NULL, 250, -- Unlimited matches, 250 miles
  1, 10000, -- 1 conversation per day, 10000 chars total
  true, true, true, false,
  false, true,
  2
) ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  matches_per_week = EXCLUDED.matches_per_week,
  max_distance_miles = EXCLUDED.max_distance_miles,
  gardener_conversations_per_day = EXCLUDED.gardener_conversations_per_day,
  gardener_character_limit = EXCLUDED.gardener_character_limit,
  has_values_matching = EXCLUDED.has_values_matching,
  has_basic_filters = EXCLUDED.has_basic_filters,
  has_advanced_filters = EXCLUDED.has_advanced_filters,
  has_full_filters = EXCLUDED.has_full_filters,
  can_see_likes = EXCLUDED.can_see_likes,
  can_disable_mindful_messaging = EXCLUDED.can_disable_mindful_messaging,
  sort_order = EXCLUDED.sort_order;

-- Gold (Premium) Tier
INSERT INTO subscription_tiers (
  name, display_name, description,
  price_monthly, price_yearly,
  matches_per_week, max_distance_miles,
  gardener_conversations_per_day, gardener_character_limit,
  has_values_matching, has_basic_filters, has_advanced_filters, has_full_filters,
  can_see_likes, can_disable_mindful_messaging,
  sort_order
) VALUES (
  'gold', '✨ Gold', 'Premium tier - Unlimited everything, see who likes you, all filters',
  19.99, 159.99,
  NULL, NULL, -- Unlimited matches, unlimited distance (US)
  NULL, 30000, -- Unlimited conversations, 30000 chars per day total
  true, true, true, true,
  true, true,
  3
) ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  matches_per_week = EXCLUDED.matches_per_week,
  max_distance_miles = EXCLUDED.max_distance_miles,
  gardener_conversations_per_day = EXCLUDED.gardener_conversations_per_day,
  gardener_character_limit = EXCLUDED.gardener_character_limit,
  has_values_matching = EXCLUDED.has_values_matching,
  has_basic_filters = EXCLUDED.has_basic_filters,
  has_advanced_filters = EXCLUDED.has_advanced_filters,
  has_full_filters = EXCLUDED.has_full_filters,
  can_see_likes = EXCLUDED.can_see_likes,
  can_disable_mindful_messaging = EXCLUDED.can_disable_mindful_messaging,
  sort_order = EXCLUDED.sort_order;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Subscription Tiers: Everyone can read active tiers
DROP POLICY IF EXISTS "Anyone can view active subscription tiers" ON subscription_tiers;
CREATE POLICY "Anyone can view active subscription tiers"
  ON subscription_tiers FOR SELECT
  USING (is_active = true);

-- User Subscriptions: Users can only see their own
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
CREATE POLICY "Users can view their own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscription" ON user_subscriptions;
CREATE POLICY "Users can insert their own subscription"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON user_subscriptions;
CREATE POLICY "Users can update their own subscription"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- User Usage: Users can only see/modify their own
DROP POLICY IF EXISTS "Users can view their own usage" ON user_usage;
CREATE POLICY "Users can view their own usage"
  ON user_usage FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage" ON user_usage;
CREATE POLICY "Users can insert their own usage"
  ON user_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own usage" ON user_usage;
CREATE POLICY "Users can update their own usage"
  ON user_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's current tier with all details
DROP FUNCTION IF EXISTS get_user_tier(uuid);
CREATE OR REPLACE FUNCTION get_user_tier(p_user_id UUID)
RETURNS TABLE (
  tier_name TEXT,
  tier_display_name TEXT,
  matches_per_week INTEGER,
  max_distance_miles INTEGER,
  gardener_conversations_per_day INTEGER,
  gardener_character_limit INTEGER,
  has_values_matching BOOLEAN,
  has_advanced_filters BOOLEAN,
  has_full_filters BOOLEAN,
  can_see_likes BOOLEAN,
  can_disable_mindful_messaging BOOLEAN
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    st.name::TEXT,
    st.display_name,
    st.matches_per_week,
    st.max_distance_miles,
    st.gardener_conversations_per_day,
    st.gardener_character_limit,
    st.has_values_matching,
    st.has_advanced_filters,
    st.has_full_filters,
    st.can_see_likes,
    st.can_disable_mindful_messaging
  FROM user_subscriptions us
  JOIN subscription_tiers st ON us.tier_id = st.id
  WHERE us.user_id = p_user_id
    AND us.status = 'active'
  LIMIT 1;

  -- If no subscription found, return Seed tier
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      st.name::TEXT,
      st.display_name,
      st.matches_per_week,
      st.max_distance_miles,
      st.gardener_conversations_per_day,
      st.gardener_character_limit,
      st.has_values_matching,
      st.has_advanced_filters,
      st.has_full_filters,
      st.can_see_likes,
      st.can_disable_mindful_messaging
    FROM subscription_tiers st
    WHERE st.name = 'seed'
    LIMIT 1;
  END IF;
END;
$$;

-- Function to initialize new user with Seed tier
-- Drop all possible trigger names first, then function
DROP TRIGGER IF EXISTS on_user_created_initialize_subscription ON users;
DROP TRIGGER IF EXISTS on_user_created_subscription ON users;
DROP FUNCTION IF EXISTS initialize_user_subscription();
CREATE OR REPLACE FUNCTION initialize_user_subscription()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  seed_tier_id UUID;
BEGIN
  -- Get Seed tier ID
  SELECT id INTO seed_tier_id
  FROM subscription_tiers
  WHERE name = 'seed'
  LIMIT 1;

  -- Create subscription for new user
  INSERT INTO user_subscriptions (user_id, tier_id, status)
  VALUES (NEW.id, seed_tier_id, 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger to auto-assign Seed tier on user creation
DROP TRIGGER IF EXISTS on_user_created_initialize_subscription ON users;
CREATE TRIGGER on_user_created_initialize_subscription
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_subscription();

-- =====================================================
-- GRANTS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT ON subscription_tiers TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_usage TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_user_tier(UUID) TO authenticated;

COMMENT ON TABLE subscription_tiers IS 'Available subscription tiers (Seed, Green, Gold)';
COMMENT ON TABLE user_subscriptions IS 'User subscription assignments and payment info';
COMMENT ON TABLE user_usage IS 'Weekly match count and daily Gardener usage tracking';
COMMENT ON FUNCTION get_user_tier(UUID) IS 'Get user tier details with fallback to Seed tier';
