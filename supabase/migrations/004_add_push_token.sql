-- Migration: add push_token to users for push notifications
-- Run in Supabase SQL editor or via CLI

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Optional index to quickly filter by token (for admin ops)
CREATE INDEX IF NOT EXISTS idx_users_push_token ON users(push_token);

-- RLS: existing policy users_update_own allows users to update their record
-- No additional policy needed