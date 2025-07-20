# Photo Upload Implementation Guide

## Overview
The photo upload system now provides real-time uploads to Supabase Storage with visual feedback and error handling.

## Architecture

### 1. **Storage Setup**
- Bucket: `profile-photos`
- Structure: `{userId}/photo_{index}_{timestamp}.jpg`
- Access: Public read, authenticated write
- RLS Policies: Users can only manage their own photos

### 2. **Components**

#### `PhotoUploadSlot.tsx`
A reusable component that handles individual photo slots:
- Shows upload progress with loading spinner
- Handles image picker integration
- Displays upload status ("Uploading...")
- Graceful error handling

#### Updated `photos.tsx`
The onboarding screen now:
- Uploads photos immediately upon selection
- Shows real-time upload progress
- Prevents navigation during uploads
- Falls back to batch upload on errors

### 3. **Upload Flow**

```
1. User taps photo slot
   ↓
2. Image picker opens
   ↓
3. User selects/crops photo
   ↓
4. Local preview shows immediately
   ↓
5. Upload to Supabase Storage begins
   ↓
6. Loading indicator shows
   ↓
7. On success: URL updated to cloud URL
   On failure: Local URI kept for batch upload
   ↓
8. User can continue when all uploads complete
```

## Key Features

### Immediate Upload
- Photos upload as soon as selected
- No waiting until form submission
- Better user experience

### Visual Feedback
- Loading spinner during upload
- "Uploading..." text indicator
- Disabled state while processing

### Error Resilience
- Failures don't block progress
- Local URIs saved as fallback
- Batch upload on save if needed

### Storage Management
- Old photos deleted when replaced
- Unique timestamps prevent conflicts
- User folders for organization

## Implementation Details

### Upload Function
```typescript
const { url, error } = await uploadPhoto(user.id, uri, index);
```

### State Management
- `photos`: Array of photo URIs/URLs
- `uploadingIndexes`: Set tracking active uploads
- Real-time UI updates during async operations

### Error Handling
- User-friendly error messages
- Graceful fallbacks
- No data loss on failures

## Testing Checklist

- [ ] Select photo - immediate upload starts
- [ ] Replace photo - old one deleted, new uploaded
- [ ] Multiple uploads - all tracked independently
- [ ] Network failure - error shown, local URI kept
- [ ] Navigate away during upload - prevented
- [ ] Complete flow - all photos in Supabase Storage

## Security Considerations

1. **Authentication Required**
   - Only logged-in users can upload
   - User ID validates ownership

2. **Storage Policies**
   - RLS ensures users access own photos only
   - Public read for profile viewing

3. **File Validation**
   - Image-only uploads
   - Size limits via quality setting
   - Square aspect ratio enforced

## Performance Optimizations

- Parallel uploads supported
- Image compression (quality: 0.8)
- Lazy loading for previews
- Efficient state updates

## Next Steps

1. **Add progress percentage**
   - Show upload progress 0-100%
   - Better for slow connections

2. **Batch operations**
   - Delete multiple photos at once
   - Bulk upload optimization

3. **Image optimization**
   - Auto-resize large images
   - Format conversion (HEIC → JPEG)

4. **Offline support**
   - Queue uploads when offline
   - Sync when connection restored