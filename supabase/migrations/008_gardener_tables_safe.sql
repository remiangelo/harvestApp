-- Create tables for Gardener AI chat and quiz features (SAFE VERSION - checks for existing objects)

-- Chat history table
CREATE TABLE IF NOT EXISTS gardener_chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'gardener')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for chat history (with IF NOT EXISTS)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gardener_chat_user_id') THEN
    CREATE INDEX idx_gardener_chat_user_id ON gardener_chat_history (user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gardener_chat_created_at') THEN
    CREATE INDEX idx_gardener_chat_created_at ON gardener_chat_history (created_at DESC);
  END IF;
END $$;

-- Quiz questions table (to track generated questions)
CREATE TABLE IF NOT EXISTS gardener_quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of {id, text, value}
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gardener_quiz_questions_question_key') THEN
    ALTER TABLE gardener_quiz_questions ADD CONSTRAINT gardener_quiz_questions_question_key UNIQUE(question);
  END IF;
END $$;

-- User quiz responses table
CREATE TABLE IF NOT EXISTS gardener_quiz_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES gardener_quiz_questions(id) ON DELETE CASCADE,
  selected_option_id VARCHAR(50) NOT NULL,
  selected_value TEXT NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gardener_quiz_responses_user_id_question_id_key') THEN
    ALTER TABLE gardener_quiz_responses ADD CONSTRAINT gardener_quiz_responses_user_id_question_id_key UNIQUE(user_id, question_id);
  END IF;
END $$;

-- Indexes for quiz responses (with IF NOT EXISTS)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quiz_responses_user_id') THEN
    CREATE INDEX idx_quiz_responses_user_id ON gardener_quiz_responses (user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quiz_responses_question_id') THEN
    CREATE INDEX idx_quiz_responses_question_id ON gardener_quiz_responses (question_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_quiz_responses_answered_at') THEN
    CREATE INDEX idx_quiz_responses_answered_at ON gardener_quiz_responses (answered_at DESC);
  END IF;
END $$;

-- User insights derived from quiz responses
CREATE TABLE IF NOT EXISTS gardener_user_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dating_style VARCHAR(100),
  communication_preference VARCHAR(100),
  relationship_goals VARCHAR(100),
  core_values TEXT[], -- Array of values
  personality_traits JSONB, -- Flexible JSON for additional traits
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gardener_user_insights_user_id_key') THEN
    ALTER TABLE gardener_user_insights ADD CONSTRAINT gardener_user_insights_user_id_key UNIQUE(user_id);
  END IF;
END $$;

-- Index for user insights (with IF NOT EXISTS)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_user_insights_user_id') THEN
    CREATE INDEX idx_user_insights_user_id ON gardener_user_insights (user_id);
  END IF;
END $$;

-- Daily quiz tracking (to ensure one quiz per day)
CREATE TABLE IF NOT EXISTS gardener_daily_quiz_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_date DATE NOT NULL DEFAULT CURRENT_DATE,
  question_id UUID REFERENCES gardener_quiz_questions(id) ON DELETE SET NULL,
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered BOOLEAN DEFAULT FALSE
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gardener_daily_quiz_tracking_user_id_quiz_date_key') THEN
    ALTER TABLE gardener_daily_quiz_tracking ADD CONSTRAINT gardener_daily_quiz_tracking_user_id_quiz_date_key UNIQUE(user_id, quiz_date);
  END IF;
END $$;

-- Index for daily quiz tracking (with IF NOT EXISTS)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_daily_quiz_user_date') THEN
    CREATE INDEX idx_daily_quiz_user_date ON gardener_daily_quiz_tracking (user_id, quiz_date DESC);
  END IF;
END $$;

-- Row Level Security policies
ALTER TABLE gardener_chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE gardener_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gardener_quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE gardener_user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE gardener_daily_quiz_tracking ENABLE ROW LEVEL SECURITY;

-- Chat history policies (DROP IF EXISTS first)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own chat history" ON gardener_chat_history;
  DROP POLICY IF EXISTS "Users can insert their own chat messages" ON gardener_chat_history;
END $$;

CREATE POLICY "Users can view their own chat history"
  ON gardener_chat_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON gardener_chat_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Quiz questions policies (public read)
DROP POLICY IF EXISTS "Anyone can view quiz questions" ON gardener_quiz_questions;

CREATE POLICY "Anyone can view quiz questions"
  ON gardener_quiz_questions
  FOR SELECT
  USING (true);

-- Quiz responses policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own quiz responses" ON gardener_quiz_responses;
  DROP POLICY IF EXISTS "Users can insert their own quiz responses" ON gardener_quiz_responses;
END $$;

CREATE POLICY "Users can view their own quiz responses"
  ON gardener_quiz_responses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz responses"
  ON gardener_quiz_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User insights policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own insights" ON gardener_user_insights;
  DROP POLICY IF EXISTS "Users can update their own insights" ON gardener_user_insights;
END $$;

CREATE POLICY "Users can view their own insights"
  ON gardener_user_insights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON gardener_user_insights
  FOR ALL
  USING (auth.uid() = user_id);

-- Daily quiz tracking policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their own quiz tracking" ON gardener_daily_quiz_tracking;
  DROP POLICY IF EXISTS "Users can manage their own quiz tracking" ON gardener_daily_quiz_tracking;
END $$;

CREATE POLICY "Users can view their own quiz tracking"
  ON gardener_daily_quiz_tracking
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own quiz tracking"
  ON gardener_daily_quiz_tracking
  FOR ALL
  USING (auth.uid() = user_id);

-- Function to get user's quiz history with questions
CREATE OR REPLACE FUNCTION get_user_quiz_history(p_user_id UUID)
RETURNS TABLE (
  question_id UUID,
  question TEXT,
  category VARCHAR(50),
  selected_value TEXT,
  answered_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.question,
    q.category,
    r.selected_value,
    r.answered_at
  FROM gardener_quiz_responses r
  JOIN gardener_quiz_questions q ON r.question_id = q.id
  WHERE r.user_id = p_user_id
  ORDER BY r.answered_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to update user insights based on quiz responses
CREATE OR REPLACE FUNCTION update_user_insights_from_quiz()
RETURNS TRIGGER AS $$
BEGIN
  -- Update or insert user insights based on the category
  INSERT INTO gardener_user_insights (user_id, last_updated)
  VALUES (NEW.user_id, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET last_updated = NOW();
  
  -- Update specific fields based on category
  UPDATE gardener_user_insights
  SET 
    dating_style = CASE 
      WHEN (SELECT category FROM gardener_quiz_questions WHERE id = NEW.question_id) = 'dating_style'
      THEN NEW.selected_value
      ELSE dating_style
    END,
    communication_preference = CASE 
      WHEN (SELECT category FROM gardener_quiz_questions WHERE id = NEW.question_id) = 'communication'
      THEN NEW.selected_value
      ELSE communication_preference
    END,
    relationship_goals = CASE 
      WHEN (SELECT category FROM gardener_quiz_questions WHERE id = NEW.question_id) = 'relationship_goals'
      THEN NEW.selected_value
      ELSE relationship_goals
    END
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_insights_on_quiz_response ON gardener_quiz_responses;

-- Create trigger to update insights when quiz is answered
CREATE TRIGGER update_insights_on_quiz_response
AFTER INSERT ON gardener_quiz_responses
FOR EACH ROW
EXECUTE FUNCTION update_user_insights_from_quiz();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Gardener tables migration completed successfully!';
END $$;