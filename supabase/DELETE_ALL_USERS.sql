-- DELETE ALL USERS - Clean slate for testing
-- Run this in your Supabase SQL Editor

-- WARNING: This will delete ALL user data from your database
-- Use with caution - this is irreversible!

BEGIN;

-- Delete all data from dependent tables first (foreign key constraints)
DELETE FROM user_activities;
DELETE FROM message_reactions;
DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM match_scores;
DELETE FROM matches;
DELETE FROM swipes;
DELETE FROM user_blocks;
DELETE FROM user_reports;
DELETE FROM user_hobbies;
DELETE FROM photos;
DELETE FROM user_preferences;
DELETE FROM user_rewards;
DELETE FROM growth_progress;
DELETE FROM gardener_interactions;

-- Delete AI safety and gardener data if tables exist
DELETE FROM safety_flags WHERE TRUE;
DELETE FROM safety_scores WHERE TRUE;
DELETE FROM chat_history WHERE TRUE;
DELETE FROM quiz_responses WHERE TRUE;
DELETE FROM user_insights WHERE TRUE;

-- Finally delete all users from the users table
DELETE FROM users;

-- Also delete from auth.users (Supabase authentication table)
-- This removes the authentication records
DELETE FROM auth.users;

COMMIT;

-- Verify deletion
SELECT COUNT(*) as remaining_users FROM users;
SELECT COUNT(*) as remaining_auth_users FROM auth.users;

-- You should see 0 for both counts
