# Harvest App - Beta Testing Setup Guide

## ✅ Backend Status: READY FOR BETA TESTING

The Harvest app backend is configured and ready for beta testing with real users. This guide provides everything you need to know for running a successful beta test.

## 🎯 Current Setup Status

### ✅ Completed Setup

1. **Database Infrastructure**
   - All required tables exist and are configured (users, matches, messages, conversations, etc.)
   - Proper column types and relationships established
   - RLS (Row Level Security) enabled on critical tables

2. **Authentication System**
   - Supabase Auth configured with email/password
   - Email confirmation set to auto-confirm (can be changed for production)
   - OAuth providers ready to configure (Google, Facebook)
   - Test mode available for development

3. **Storage System**
   - Profile photos stored in Supabase (URLs in database)
   - Message images supported through media_url field
   - Storage buckets need to be created (see setup below)

4. **Real-time Features**
   - Chat infrastructure ready with Supabase Realtime
   - Typing indicators implemented
   - Presence detection available

5. **App Configuration**
   - Demo profiles marked as deprecated
   - Real user fetching implemented in swipe screen
   - Authentication flows working

## 🚀 Quick Setup for Beta Testing

### Step 1: Create Storage Buckets and Fix RLS Policies

**IMPORTANT**: A migration has already been applied that created the storage buckets and RLS policies.

If you need to verify or reapply, run this SQL in your Supabase dashboard (SQL Editor):

```sql
-- Run the contents of CORRECTED_BETA_SQL.sql
-- This file has been verified against your actual database structure
```

✅ **Already Completed**:

- Storage buckets created (profile-photos, message-images)
- RLS policies applied for swipes, matches, messages, and conversations

### Step 2: Configure Email Settings (Optional but Recommended)

1. Go to Supabase Dashboard → Authentication → Settings
2. Toggle "Enable email confirmations" based on your preference
3. For production, set up SMTP (Resend recommended: $20/month)

### Step 3: Environment Variables

Ensure these are set in your .env file:

```env
EXPO_PUBLIC_SUPABASE_URL=https://jutzlxdboayvmcuqwodn.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Deploy to TestFlight

```bash
# Build for TestFlight
npx eas build --clear-cache --platform ios --profile preview

# Submit to TestFlight
npx eas submit --platform ios --profile preview
```

## 📱 What Beta Testers Can Do

### Core Features Available

1. **Account Creation**
   - Sign up with email/password
   - Complete onboarding questionnaire
   - Upload profile photos
   - Set preferences (age range, distance, etc.)

2. **Discovery & Matching**
   - Browse real profiles (no more demo data)
   - Swipe left/right/up for nope/like/super-like
   - Get match notifications
   - Filter by preferences

3. **Messaging**
   - Send text messages
   - Share photos in chat
   - See typing indicators
   - Real-time message delivery

4. **Profile Management**
   - Edit profile information
   - Update photos
   - Change preferences
   - Manage settings

5. **AI Features (if API key configured)**
   - Gardener AI coach
   - Daily relationship quizzes
   - Safety analysis (with OpenAI key)

## ⚠️ Known Limitations

1. **Push Notifications**: Require additional setup with Expo Push Notification service
2. **OAuth Login**: Google/Facebook require provider configuration in Supabase
3. **Email Confirmation**: Currently auto-confirms; production should require verification
4. **Location Services**: Basic implementation; needs refinement for distance calculations

## 📊 Monitoring Beta Test

### Key Metrics to Track

1. **User Signups**: Monitor in Supabase Dashboard → Authentication
2. **Active Users**: Check daily active users
3. **Matches Created**: Query matches table
4. **Messages Sent**: Monitor conversations table
5. **Storage Usage**: Check Storage tab for photo uploads

### Useful Queries

```sql
-- Count total users
SELECT COUNT(*) FROM users WHERE onboarding_completed = true;

-- Count matches today
SELECT COUNT(*) FROM matches WHERE DATE(matched_at) = CURRENT_DATE;

-- Active conversations
SELECT COUNT(DISTINCT conversation_id) FROM messages
WHERE DATE(created_at) = CURRENT_DATE;
```

## 🔧 Troubleshooting

### Common Issues and Solutions

1. **Users can't swipe**
   - Check if RLS policies are properly configured
   - Ensure user has completed onboarding

2. **Photos not uploading**
   - Verify storage buckets exist
   - Check bucket policies allow authenticated uploads

3. **Messages not sending**
   - Confirm conversation exists for the match
   - Check RLS policies on messages table

4. **Matches not creating**
   - Verify both users have swiped on each other
   - Check matches table RLS policies

## 🛠️ Admin Tools

### Test Scripts Available

1. **setup-beta-backend.js** - Verify backend configuration
2. **test-beta-flow.js** - Test complete user flow
3. **clearTestMode.js** - Clear test mode data

### Running Tests

```bash
# Check backend setup
node setup-beta-backend.js

# Test user flow
node test-beta-flow.js

# Clear test data
node clearTestMode.js
```

## 📈 Scaling Considerations

### Current Capacity

- **Free tier**: Good for ~500 active users
- **Pro tier ($25/month)**: Supports 5,000+ users
- **Current setup**: Can handle 100-500 beta testers easily

### When to Upgrade

- More than 500 daily active users
- Need higher storage limits (>1GB)
- Require dedicated support

## 🚦 Beta Testing Checklist

Before inviting beta testers:

- [ ] Storage buckets created
- [ ] RLS policies configured
- [ ] Test user flow working
- [ ] Error tracking set up (Sentry recommended)
- [ ] Feedback mechanism in place
- [ ] Terms of service and privacy policy ready
- [ ] TestFlight build submitted and approved

## 💡 Tips for Successful Beta

1. **Start Small**: Begin with 10-20 testers
2. **Gather Feedback**: Use in-app feedback or surveys
3. **Monitor Daily**: Check Supabase dashboard regularly
4. **Fix Quickly**: Address critical bugs immediately
5. **Communicate**: Keep testers informed of updates

## 🆘 Support Resources

- **Supabase Dashboard**: https://supabase.com/dashboard/project/jutzlxdboayvmcuqwodn
- **Documentation**: Check CLAUDE.md for app-specific details
- **Database Schema**: Review migration files in /supabase folder

## 🎉 Ready to Launch Beta!

Your backend is configured and ready. Users can now:

- Sign up with real email addresses
- Upload actual photos
- Match with other beta testers
- Send messages and images
- Experience the full app flow

Good luck with your beta test! 🚀
