# Photo Upload Testing Guide

## Prerequisites
1. Ensure Supabase Storage bucket is created:
   ```sql
   -- Run in Supabase SQL Editor
   -- Use the script from supabase/storage-buckets.sql
   ```

2. Environment variables are set:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

## Testing Steps

### 1. Basic Upload Test
1. Create new account or login
2. Navigate to onboarding photos screen
3. Tap any empty photo slot
4. Select a photo from gallery
5. **Expected**: 
   - Photo appears immediately
   - "Uploading..." text shows
   - Loading spinner visible
   - Continue button disabled

### 2. Upload Success Test
1. Wait for upload to complete
2. **Expected**:
   - Loading spinner disappears
   - "Uploading..." text gone
   - Continue button enabled
   - Photo remains visible

### 3. Replace Photo Test
1. Tap an existing photo slot
2. Select a different photo
3. **Expected**:
   - Old photo replaced immediately
   - Upload process starts
   - Old photo deleted from storage

### 4. Multiple Upload Test
1. Select photos in slots 1, 2, 3 rapidly
2. **Expected**:
   - All three upload simultaneously
   - Each shows individual progress
   - Continue disabled until all complete

### 5. Network Failure Test
1. Enable airplane mode
2. Select a photo
3. **Expected**:
   - Error alert appears
   - Photo kept locally
   - Can still continue (will upload on save)

### 6. Verify in Supabase
1. Go to Supabase Dashboard
2. Navigate to Storage → profile-photos
3. **Expected**:
   - Folder with user ID exists
   - Photos named: `photo_0_[timestamp].jpg`
   - All uploads present

## Common Issues

### "Please log in to upload photos"
- User session expired
- Solution: Logout and login again

### Upload stays in progress forever
- Network timeout
- Solution: Check internet connection

### Photos not showing after upload
- Storage bucket not public
- Solution: Check bucket policies

## Performance Metrics
- Upload time: 2-5 seconds on good connection
- Image quality: 80% compression
- Max file size: ~2-3MB after compression