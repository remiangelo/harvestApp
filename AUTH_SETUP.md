# Harvest App - Authentication Setup Guide

## Overview
The Harvest app now has a complete authentication system integrated with Supabase. This guide will help you set up and understand the authentication flow.

## Prerequisites
1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project in Supabase
3. **Environment Variables**: Get your project URL and anon key from Supabase

## Setup Steps

### 1. Create Supabase Project
1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: `harvest-app`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)

### 2. Set Up Database Tables
1. Go to SQL Editor in Supabase Dashboard
2. Run the migration script: `supabase/migrations/001_initial_schema.sql`
3. This creates all necessary tables with RLS policies

### 3. Set Up Storage Buckets
1. Go to SQL Editor
2. Run the storage script: `supabase/storage-buckets.sql`
3. This creates the `profile-photos` bucket with proper permissions

### 4. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your credentials from Supabase:
   - Go to Settings → API
   - Copy the `Project URL` and `anon public` key

3. Update `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

### 5. Enable Email Authentication
1. Go to Authentication → Providers in Supabase
2. Ensure Email is enabled (it should be by default)
3. Configure email templates if desired

## Authentication Flow

### Registration
1. User enters email and password
2. Account is created in Supabase Auth
3. User profile is created in `users` table
4. User is redirected to onboarding

### Login
1. User enters credentials
2. Supabase validates and returns session
3. User profile is loaded from database
4. If onboarding incomplete → redirect to onboarding
5. If onboarding complete → redirect to main app

### Profile Management
- User data is stored in `users` table
- Photos are stored in Supabase Storage
- Profile updates are saved in real-time

### Security Features
- Row Level Security (RLS) policies protect user data
- Users can only access their own data
- Secure session management with auto-refresh
- Password reset functionality (built into Supabase)

## Key Components

### Auth Store (`stores/useAuthStore.ts`)
- Manages authentication state
- Handles login/logout/register
- Persists session with AsyncStorage
- Syncs with user profile data

### Auth Guard (`components/AuthGuard.tsx`)
- Protects routes requiring authentication
- Redirects unauthenticated users to login
- Ensures onboarding completion

### Profile Service (`lib/profiles.ts`)
- CRUD operations for user profiles
- Photo upload/delete functions
- Profile completion tracking

## Testing the Auth Flow

### Create Test Account
1. Run the app: `npm start`
2. Click "Sign Up"
3. Enter test email and password
4. Complete onboarding flow
5. Your profile is now saved in Supabase!

### Test Features
- ✅ Registration with email/password
- ✅ Login with credentials
- ✅ Profile persistence
- ✅ Photo uploads
- ✅ Logout functionality
- ✅ Session persistence
- ✅ Protected routes

## Troubleshooting

### "Supabase not configured" Error
- Ensure `.env` file exists with correct values
- Restart Metro bundler after adding env vars

### Login Not Working
- Check Supabase Dashboard for user creation
- Verify email/password are correct
- Check console for error messages

### Photos Not Uploading
- Ensure storage bucket is created
- Check RLS policies on storage bucket
- Verify user is authenticated

## Next Steps
1. Enable social logins (Google, Apple, etc.)
2. Add email verification
3. Implement password reset flow
4. Add two-factor authentication

## Production Checklist
- [ ] Use strong database password
- [ ] Enable email confirmation
- [ ] Configure custom email templates
- [ ] Set up proper CORS for web
- [ ] Monitor authentication logs
- [ ] Set up backup strategies