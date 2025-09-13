-- Create safety analysis tables for AI red flag detection

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Safety analysis results table
CREATE TABLE IF NOT EXISTS safety_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES users(id) ON DELETE CASCADE,
  safety_score INTEGER CHECK (safety_score >= 0 AND safety_score <= 100),
  red_flags JSONB DEFAULT '[]'::jsonb,
  recommendations TEXT[] DEFAULT '{}',
  allow_contact_sharing BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT safety_analyses_conversation_user_key UNIQUE (conversation_id, user_id, created_at)
);

-- Create indexes for faster queries
CREATE INDEX idx_safety_analyses_user_id ON safety_analyses(user_id);
CREATE INDEX idx_safety_analyses_match_id ON safety_analyses(match_id);
CREATE INDEX idx_safety_analyses_conversation_id ON safety_analyses(conversation_id);
CREATE INDEX idx_safety_analyses_created_at ON safety_analyses(created_at DESC);
CREATE INDEX idx_safety_analyses_safety_score ON safety_analyses(safety_score);

-- Red flag reports table
CREATE TABLE IF NOT EXISTS red_flag_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  flag_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  evidence TEXT,
  ai_detected BOOLEAN DEFAULT false,
  user_reported BOOLEAN DEFAULT false,
  reviewed BOOLEAN DEFAULT false,
  action_taken VARCHAR(50),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for red flag reports
CREATE INDEX idx_red_flag_reports_reporter_id ON red_flag_reports(reporter_id);
CREATE INDEX idx_red_flag_reports_reported_user_id ON red_flag_reports(reported_user_id);
CREATE INDEX idx_red_flag_reports_conversation_id ON red_flag_reports(conversation_id);
CREATE INDEX idx_red_flag_reports_reviewed ON red_flag_reports(reviewed);
CREATE INDEX idx_red_flag_reports_severity ON red_flag_reports(severity);
CREATE INDEX idx_red_flag_reports_created_at ON red_flag_reports(created_at DESC);

-- User safety settings table
CREATE TABLE IF NOT EXISTS user_safety_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  ai_monitoring_enabled BOOLEAN DEFAULT true,
  strict_mode BOOLEAN DEFAULT false,
  auto_blur_sensitive_content BOOLEAN DEFAULT true,
  require_video_before_sharing BOOLEAN DEFAULT false,
  min_chat_duration_hours INTEGER DEFAULT 24,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for user safety settings
CREATE INDEX idx_user_safety_settings_updated_at ON user_safety_settings(updated_at DESC);

-- Ready to move off app tracking
CREATE TABLE IF NOT EXISTS ready_to_move_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  safety_score INTEGER CHECK (safety_score >= 0 AND safety_score <= 100),
  approved BOOLEAN DEFAULT false,
  contact_shared BOOLEAN DEFAULT false,
  contact_method VARCHAR(20) CHECK (contact_method IN ('phone', 'social', 'email')),
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for ready to move checks
CREATE INDEX idx_ready_to_move_checks_user_id ON ready_to_move_checks(user_id);
CREATE INDEX idx_ready_to_move_checks_conversation_id ON ready_to_move_checks(conversation_id);
CREATE INDEX idx_ready_to_move_checks_checked_at ON ready_to_move_checks(checked_at DESC);

-- Safety metrics aggregation (for dashboard)
CREATE OR REPLACE VIEW user_safety_metrics AS
SELECT 
  u.user_id,
  COUNT(DISTINCT sa.conversation_id) as conversations_analyzed,
  AVG(sa.safety_score) as avg_safety_score,
  COUNT(DISTINCT rfr.id) as red_flags_detected,
  COUNT(DISTINCT CASE WHEN rfr.severity = 'critical' THEN rfr.id END) as critical_flags,
  COUNT(DISTINCT rtm.id) as move_off_app_attempts,
  COUNT(DISTINCT CASE WHEN rtm.approved THEN rtm.id END) as approved_moves,
  MAX(sa.created_at) as last_analysis
FROM user_safety_settings u
LEFT JOIN safety_analyses sa ON u.user_id = sa.user_id
LEFT JOIN red_flag_reports rfr ON u.user_id = rfr.reporter_id
LEFT JOIN ready_to_move_checks rtm ON u.user_id = rtm.user_id
GROUP BY u.user_id;

-- Function to update user safety settings timestamp
CREATE OR REPLACE FUNCTION update_user_safety_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
CREATE TRIGGER update_user_safety_settings_timestamp
BEFORE UPDATE ON user_safety_settings
FOR EACH ROW
EXECUTE FUNCTION update_user_safety_settings_timestamp();

-- Row Level Security (RLS) policies
ALTER TABLE safety_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE red_flag_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_safety_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ready_to_move_checks ENABLE ROW LEVEL SECURITY;

-- Policies for safety_analyses
CREATE POLICY "Users can view their own safety analyses" ON safety_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert safety analyses" ON safety_analyses
  FOR INSERT WITH CHECK (true);

-- Policies for red_flag_reports
CREATE POLICY "Users can create red flag reports" ON red_flag_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view reports they created" ON red_flag_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Policies for user_safety_settings
CREATE POLICY "Users can view their own safety settings" ON user_safety_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own safety settings" ON user_safety_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own safety settings" ON user_safety_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for ready_to_move_checks
CREATE POLICY "Users can view their own move checks" ON ready_to_move_checks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert move checks" ON ready_to_move_checks
  FOR INSERT WITH CHECK (true);

-- Grant permissions for authenticated users
GRANT SELECT, INSERT ON safety_analyses TO authenticated;
GRANT SELECT, INSERT ON red_flag_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_safety_settings TO authenticated;
GRANT SELECT, INSERT ON ready_to_move_checks TO authenticated;
GRANT SELECT ON user_safety_metrics TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE safety_analyses IS 'Stores AI safety analysis results for conversations';
COMMENT ON TABLE red_flag_reports IS 'Tracks reported red flags from AI detection and user reports';
COMMENT ON TABLE user_safety_settings IS 'User preferences for safety features';
COMMENT ON TABLE ready_to_move_checks IS 'Tracks when users attempt to move conversations off-app';
COMMENT ON VIEW user_safety_metrics IS 'Aggregated safety metrics for user dashboard';