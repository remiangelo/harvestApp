-- Add user1_id and user2_id columns to conversations table
-- These are denormalized from the matches table for easier querying

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS user1_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS user2_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS last_message TEXT,
  ADD COLUMN IF NOT EXISTS last_message_time TIMESTAMP WITH TIME ZONE;

-- Backfill existing conversations with user IDs from matches
UPDATE conversations c
SET 
  user1_id = m.user1_id,
  user2_id = m.user2_id
FROM matches m
WHERE c.match_id = m.id
  AND (c.user1_id IS NULL OR c.user2_id IS NULL);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_user1_id ON conversations(user1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user2_id ON conversations(user2_id);
