-- Create storage buckets for Harvest app beta testing
-- Run this in your Supabase SQL editor

-- Create profile-photos bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  true, -- Public bucket so photos can be viewed by other users
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create message-images bucket for chat
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-images',
  'message-images',
  false, -- Private bucket - only accessible to authenticated users
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Set up RLS policies for profile-photos bucket
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
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Set up RLS policies for message-images bucket
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

CREATE POLICY "Users can update their own message images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'message-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own message images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'message-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Verify buckets were created
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id IN ('profile-photos', 'message-images');