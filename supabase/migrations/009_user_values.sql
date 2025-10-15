-- Migration: User Values for Values-Based Matching
-- This creates tables to store user values (what they bring and what they seek)

-- Create values table to store available values
CREATE TABLE IF NOT EXISTS public.values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- e.g., 'personality', 'lifestyle', 'communication', 'emotional'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_values_brought table (what values user brings to relationship)
CREATE TABLE IF NOT EXISTS public.user_values_brought (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  value_id UUID NOT NULL REFERENCES public.values(id) ON DELETE CASCADE,
  ranking INTEGER NOT NULL, -- 1-5, where 1 is most important
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, value_id),
  UNIQUE(user_id, ranking) -- Each ranking number can only be used once per user
);

-- Create user_values_sought table (what values user seeks in partner)
CREATE TABLE IF NOT EXISTS public.user_values_sought (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  value_id UUID NOT NULL REFERENCES public.values(id) ON DELETE CASCADE,
  ranking INTEGER NOT NULL, -- 1-5, where 1 is most important
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, value_id),
  UNIQUE(user_id, ranking) -- Each ranking number can only be used once per user
);

-- Insert predefined values
INSERT INTO public.values (name, category, description) VALUES
  -- Personality Values
  ('Adventurous', 'personality', 'Loves trying new things and taking risks'),
  ('Reliable', 'personality', 'Consistent, dependable, and trustworthy'),
  ('Spontaneous', 'personality', 'Goes with the flow, embraces unpredictability'),
  ('Thoughtful', 'personality', 'Considerate of others'' feelings and needs'),
  ('Ambitious', 'personality', 'Goal-oriented and driven to succeed'),
  ('Laid-back', 'personality', 'Easygoing and relaxed approach to life'),
  ('Playful', 'personality', 'Fun-loving, lighthearted, enjoys humor'),
  ('Introspective', 'personality', 'Self-aware, reflective, values depth'),

  -- Communication Values
  ('Direct Communicator', 'communication', 'Says what they mean clearly and honestly'),
  ('Good Listener', 'communication', 'Truly hears and understands others'),
  ('Emotionally Open', 'communication', 'Comfortable sharing feelings and vulnerabilities'),
  ('Respectful in Conflict', 'communication', 'Handles disagreements with maturity'),
  ('Affectionate', 'communication', 'Expresses love through words and touch'),

  -- Lifestyle Values
  ('Health-Conscious', 'lifestyle', 'Prioritizes physical and mental wellness'),
  ('Socially Active', 'lifestyle', 'Enjoys spending time with friends and groups'),
  ('Homebody', 'lifestyle', 'Values quiet time at home'),
  ('Career-Focused', 'lifestyle', 'Professional success is a priority'),
  ('Family-Oriented', 'lifestyle', 'Values close family connections'),
  ('Creative', 'lifestyle', 'Expresses themselves through art, music, or ideas'),
  ('Intellectual', 'lifestyle', 'Values learning and deep conversations'),

  -- Emotional Values
  ('Supportive', 'emotional', 'Encourages and uplifts their partner'),
  ('Independent', 'emotional', 'Maintains own identity within relationship'),
  ('Loyal', 'emotional', 'Committed and faithful'),
  ('Patient', 'emotional', 'Understanding and not easily frustrated'),
  ('Empathetic', 'emotional', 'Deeply attuned to others'' emotions'),
  ('Optimistic', 'emotional', 'Maintains positive outlook on life')
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_values_brought ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_values_sought ENABLE ROW LEVEL SECURITY;

-- RLS Policies for values table (everyone can read)
DROP POLICY IF EXISTS "Anyone can read values" ON public.values;
CREATE POLICY "Anyone can read values"
  ON public.values FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_values_brought
DROP POLICY IF EXISTS "Users can read all user values brought" ON public.user_values_brought;
CREATE POLICY "Users can read all user values brought"
  ON public.user_values_brought FOR SELECT
  TO authenticated
  USING (true); -- Allow users to see others' values for matching

DROP POLICY IF EXISTS "Users can insert own values brought" ON public.user_values_brought;
CREATE POLICY "Users can insert own values brought"
  ON public.user_values_brought FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own values brought" ON public.user_values_brought;
CREATE POLICY "Users can update own values brought"
  ON public.user_values_brought FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own values brought" ON public.user_values_brought;
CREATE POLICY "Users can delete own values brought"
  ON public.user_values_brought FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_values_sought (same as brought)
DROP POLICY IF EXISTS "Users can read all user values sought" ON public.user_values_sought;
CREATE POLICY "Users can read all user values sought"
  ON public.user_values_sought FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own values sought" ON public.user_values_sought;
CREATE POLICY "Users can insert own values sought"
  ON public.user_values_sought FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own values sought" ON public.user_values_sought;
CREATE POLICY "Users can update own values sought"
  ON public.user_values_sought FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own values sought" ON public.user_values_sought;
CREATE POLICY "Users can delete own values sought"
  ON public.user_values_sought FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_values_brought_user_id ON public.user_values_brought(user_id);
CREATE INDEX IF NOT EXISTS idx_user_values_brought_value_id ON public.user_values_brought(value_id);
CREATE INDEX IF NOT EXISTS idx_user_values_sought_user_id ON public.user_values_sought(user_id);
CREATE INDEX IF NOT EXISTS idx_user_values_sought_value_id ON public.user_values_sought(value_id);
CREATE INDEX IF NOT EXISTS idx_values_category ON public.values(category);

-- Add updated_at trigger for user_values_brought
CREATE OR REPLACE FUNCTION update_user_values_brought_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_values_brought_updated_at_trigger ON public.user_values_brought;
CREATE TRIGGER update_user_values_brought_updated_at_trigger
  BEFORE UPDATE ON public.user_values_brought
  FOR EACH ROW
  EXECUTE FUNCTION update_user_values_brought_updated_at();

-- Add updated_at trigger for user_values_sought
CREATE OR REPLACE FUNCTION update_user_values_sought_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_values_sought_updated_at_trigger ON public.user_values_sought;
CREATE TRIGGER update_user_values_sought_updated_at_trigger
  BEFORE UPDATE ON public.user_values_sought
  FOR EACH ROW
  EXECUTE FUNCTION update_user_values_sought_updated_at();
