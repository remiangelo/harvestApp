# Complete Supabase Setup Guide

## Overview
This guide will help you set up the complete backend for the Harvest dating app, including authentication, database tables, storage, and real-time features.

## Prerequisites
1. Supabase account at [supabase.com](https://supabase.com)
2. Supabase project created
3. Environment variables configured in `.env`

## Step-by-Step Setup

### 1. Run Database Migrations

Run these SQL scripts in order in your Supabase SQL Editor:

1. **Initial Schema** (`supabase/migrations/001_initial_schema.sql`)
   - Creates users table with basic structure
   - Sets up user preferences
   - Creates necessary extensions

2. **Matching System** (`supabase/migrations/002_matching_system.sql`)
   - Creates swipes table for tracking likes/dislikes
   - Creates matches table for mutual connections
   - Creates messages table for chat
   - Sets up automatic matching triggers
   - Implements Row Level Security

3. **Users Table Updates** (`supabase/migrations/003_users_table_updates.sql`)
   - Updates users table to match our onboarding flow
   - Adds discovery functions
   - Creates match retrieval functions

### 2. Create Storage Buckets

Run this in SQL Editor:

```sql
-- Create profile photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT DO NOTHING;
```

### 3. Enable Realtime

In Supabase Dashboard:
1. Go to Database → Replication
2. Enable replication for these tables:
   - `messages` (for real-time chat)
   - `matches` (for instant match notifications)

### 4. Test Your Setup

Run these test queries to verify everything works:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Test user creation
INSERT INTO users (email, nickname, age, onboarding_completed)
VALUES ('test@example.com', 'TestUser', 25, true);

-- Test discovery function
SELECT * FROM get_discovery_profiles(
  gen_random_uuid(), -- fake user id
  'Straight',
  50,
  10
);
```

## Database Schema Overview

### Core Tables

1. **users**
   - Stores user profiles with onboarding data
   - Includes: nickname, age, bio, photos, preferences, etc.

2. **swipes**
   - Records all swipe actions (like, nope, super_like)
   - Unique constraint prevents duplicate swipes

3. **matches**
   - Created automatically when users like each other
   - Tracks unmatch status and last interaction

4. **messages**
   - Chat messages between matched users
   - Includes read status and timestamps

### Key Functions

1. **check_mutual_match()**
   - Trigger function that creates matches automatically

2. **get_discovery_profiles()**
   - Returns profiles for swiping based on preferences

3. **get_user_matches()**
   - Returns all matches with user details and unread counts

## Security Features

### Row Level Security (RLS)
- Users can only create/view their own swipes
- Users can only see matches they're part of
- Messages are restricted to match participants

### Data Validation
- Age must be 18+
- No self-swiping
- Unique swipes per user pair
- Ordered user IDs in matches table

## API Usage Examples

### Save a Swipe
```typescript
const { data, error } = await supabase
  .from('swipes')
  .insert({
    swiper_id: currentUserId,
    swiped_id: targetUserId,
    action: 'like' // or 'nope', 'super_like'
  });
```

### Get Discovery Profiles
```typescript
const { data, error } = await supabase
  .rpc('get_discovery_profiles', {
    user_id: currentUserId,
    user_preferences: userPreferences,
    user_distance: 50,
    limit_count: 10
  });
```

### Get User Matches
```typescript
const { data, error } = await supabase
  .rpc('get_user_matches', {
    user_id: currentUserId
  });
```

### Send a Message
```typescript
const { data, error } = await supabase
  .from('messages')
  .insert({
    match_id: matchId,
    sender_id: currentUserId,
    content: messageText
  });
```

### Subscribe to New Messages
```typescript
const subscription = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `match_id=eq.${matchId}`
  }, (payload) => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

## Troubleshooting

### Common Issues

1. **"relation does not exist" error**
   - Make sure you ran migrations in order
   - Check that you're in the correct schema (public)

2. **RLS blocking queries**
   - Ensure user is authenticated
   - Check RLS policies match your use case

3. **Functions not found**
   - Verify functions were created successfully
   - Check function names and parameters

### Debug Queries

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename IN ('users', 'swipes', 'matches', 'messages');

-- Check triggers
SELECT * FROM information_schema.triggers WHERE trigger_schema = 'public';

-- Check functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' AND routine_schema = 'public';
```

## Next Steps

1. ✅ Database setup complete
2. ✅ Storage configured
3. ✅ Real-time enabled
4. ✅ Security policies active

Now you can proceed with implementing:
- Match interface (save swipes)
- Profile discovery
- Chat functionality
- Push notifications

Your Supabase backend is now fully configured and ready for the Harvest dating app!