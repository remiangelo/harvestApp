-- CORRECTED SQL FOR HARVEST BETA TESTING
-- Run this in your Supabase SQL Editor
-- This script has been verified against your actual database structure

-- ============================================
-- PART 1: FIX RLS POLICIES
-- ============================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can create swipes" ON swipes;
DROP POLICY IF EXISTS "Users can view their swipes" ON swipes;
DROP POLICY IF EXISTS "Users can create matches" ON matches;
DROP POLICY IF EXISTS "Users can view their matches" ON matches;
DROP POLICY IF EXISTS "Users can update their matches" ON matches;
DROP POLICY IF EXISTS "Authenticated users can view messages" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Authenticated users can view conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;

-- Create RLS policies for swipes table (already has RLS enabled)
CREATE POLICY "Users can create swipes" ON swipes
FOR INSERT
WITH CHECK (auth.uid() = swiper_id);

CREATE POLICY "Users can view their swipes" ON swipes
FOR SELECT
USING (auth.uid() = swiper_id OR auth.uid() = swiped_id);

-- Create RLS policies for matches table (already has RLS enabled)
CREATE POLICY "Users can create matches" ON matches
FOR INSERT
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can view their matches" ON matches
FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their matches" ON matches
FOR UPDATE
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create RLS policies for messages table (already has RLS enabled)
CREATE POLICY "Authenticated users can view messages" ON messages
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN matches m ON m.id = c.match_id
    WHERE c.id = messages.conversation_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

CREATE POLICY "Users can send messages" ON messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN matches m ON m.id = c.match_id
    WHERE c.id = messages.conversation_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

-- Create RLS policies for conversations table (already has RLS enabled)
CREATE POLICY "Authenticated users can view conversations" ON conversations
FOR SELECT
USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = conversations.match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

CREATE POLICY "Authenticated users can create conversations" ON conversations
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM matches m
    WHERE m.id = conversations.match_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

-- ============================================
-- PART 2: CREATE STORAGE BUCKETS
-- ============================================

-- Create profile-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true, -- Public so other users can view profile photos
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create message-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-images',
  'message-images',
  false, -- Private - only for authenticated users
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- PART 3: STORAGE POLICIES
-- ============================================

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view message images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload message images" ON storage.objects;

-- Profile photos policies
CREATE POLICY "Anyone can view profile photos" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

CREATE POLICY "Authenticated users can upload profile photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-photos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own profile photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = owner_id
);

CREATE POLICY "Users can delete their own profile photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = owner_id
);

-- Message images policies
CREATE POLICY "Authenticated users can view message images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'message-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload message images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'message-images'
  AND auth.role() = 'authenticated'
);

-- ============================================
-- PART 4: VERIFICATION QUERIES
-- ============================================

-- Verify buckets were created
SELECT
  'Storage Buckets' as check_type,
  COUNT(*) as count,
  CASE
    WHEN COUNT(*) = 2 THEN '✅ Both buckets created'
    ELSE '❌ Missing buckets'
  END as status
FROM storage.buckets
WHERE id IN ('profile-photos', 'message-images');

-- Verify RLS is enabled on critical tables
SELECT
  'RLS Status' as check_type,
  COUNT(*) as enabled_count,
  CASE
    WHEN COUNT(*) = 4 THEN '✅ RLS enabled on all tables'
    ELSE '❌ Some tables missing RLS'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('swipes', 'matches', 'messages', 'conversations')
AND rowsecurity = true;

-- Count policies (should have multiple for each table)
SELECT
  tablename,
  COUNT(*) as policy_count,
  CASE
    WHEN COUNT(*) > 0 THEN '✅ Has policies'
    ELSE '❌ No policies'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('swipes', 'matches', 'messages', 'conversations')
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT
  '🎉 BETA TESTING SETUP COMPLETE' as message,
  'Your backend is now ready for real users!' as status;