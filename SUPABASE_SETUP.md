# Supabase Setup Guide for Harvest App

## Quick Start

1. **Create a Supabase Project**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Click "New Project"
   - Enter project details:
     - Name: "Harvest Dating App"
     - Database Password: (save this securely)
     - Region: Choose closest to your users

2. **Get Your API Keys**
   - Go to Settings → API
   - Copy your `Project URL` and `anon public` key

3. **Create Environment File**

   ```bash
   cp .env.example .env
   ```

   Then add your credentials:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_project_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Run Database Migrations**
   - Go to SQL Editor in Supabase Dashboard
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the SQL to create all tables

5. **Enable Authentication**
   - Go to Authentication → Providers
   - Enable Email provider
   - Configure email templates (optional)

6. **Create Storage Bucket for Photos**
   - Go to Storage in Supabase Dashboard
   - Click "New bucket"
   - Name: `profile-photos`
   - Public bucket: ✅ (check this)
   - Click "Create bucket"
   
   Then set the policy:
   - Click on the bucket → Policies
   - Create a new policy: "Allow authenticated uploads"
   - For authenticated users: INSERT, SELECT, DELETE

## Testing the App

1. **Start the app**

   ```bash
   npm start
   ```

2. **Create a test account**
   - Use the Sign Up form in the app
   - Check your email for verification (if enabled)

3. **Test Features**
   - Complete onboarding flow
   - Upload profile photos
   - Test swiping functionality

## Database Schema Overview

### Core Tables

- `users` - User profiles and demographics
- `user_preferences` - Dating preferences
- `photos` - Profile photos
- `user_hobbies` - Interests/hobbies
- `swipes` - Like/nope actions
- `matches` - Mutual likes
- `conversations` - Chat threads
- `messages` - Individual messages

### Unique Features

- `gardener_interactions` - AI coach conversations
- `growth_progress` - Lesson completion tracking
- `user_rewards` - Coins and gamification

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Matches can see limited profile information
- All API calls require authentication

## Next Steps

1. **Configure Storage**
   - Create a bucket for profile photos
   - Set up public access policies

2. **Set Up Edge Functions** (optional)
   - Matching algorithm
   - Push notifications
   - Daily recommendations

3. **Enable Realtime**
   - For chat messages
   - For match notifications
   - For online status

## Troubleshooting

### Common Issues

1. **"Supabase URL and Anon Key are required" warning**
   - Make sure you created `.env` file
   - Restart Metro bundler after adding env vars

2. **Authentication errors**
   - Check if email provider is enabled
   - Verify your API keys are correct
   - Check network connection

3. **Database errors**
   - Ensure migrations ran successfully
   - Check RLS policies
   - Verify table permissions

## Production Checklist

- [ ] Enable email verification
- [ ] Configure custom email templates
- [ ] Set up proper RLS policies
- [ ] Enable rate limiting
- [ ] Configure backup schedule
- [ ] Set up monitoring/alerts
- [ ] Review security settings

## Support

- Supabase Docs: <https://supabase.com/docs>
- Discord: <https://discord.supabase.com>
- GitHub Issues: For app-specific issues
