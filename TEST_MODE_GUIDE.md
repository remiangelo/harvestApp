# Test Mode Guide - Harvest App

## Overview
I've implemented a Test Mode that allows you to bypass email authentication and test the app without needing to create a real Supabase account or deal with email verification.

## How to Use Test Mode

### 1. Start the App
```bash
npm start
# or
expo start
```

### 2. Access Test Mode
On the login screen, you'll see a new button (only visible in development mode):
- **"Enter Test Mode (No Email Required)"** - Click this button

### 3. What Happens
- A test user is created locally without any Supabase interaction
- You're automatically redirected to the onboarding flow
- Your test data is saved to AsyncStorage (persists across app restarts)

### 4. Test User Details
The test user has these default properties:
- Email: testuser@harvest.com
- Name: Test User
- Age: 25
- Location: Test City
- No photos initially (you'll add them in onboarding)

## Features in Test Mode

### ✅ What Works
- Complete onboarding flow (all 11 steps)
- Profile creation and editing
- Swipe cards and gestures
- Filter preferences
- Settings screens
- Navigation between screens
- Data persistence (your test data is saved locally)

### ⚠️ Limitations
- Photos are stored locally (not uploaded to Supabase)
- No real matching (since other users aren't real)
- No chat functionality (requires real users)
- No push notifications
- Profile edits save locally only

## Logging Out
- Use the logout button in settings
- This clears all test data
- You can enter test mode again for a fresh start

## Switching to Real Auth
To test with real email authentication:
1. Don't click "Test Mode"
2. Create a real account with email/password
3. Ensure your `.env` file has valid Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
   ```

## Troubleshooting

### Test Mode Not Showing
- Ensure you're running in development mode (`__DEV__` is true)
- The button only appears in development builds

### Data Not Persisting
- Test data is stored in AsyncStorage
- Clear app data/cache if you encounter issues

### Can't Exit Test Mode
- Use the logout function in settings
- Or manually clear AsyncStorage:
  ```javascript
  AsyncStorage.removeItem('harvest-test-mode')
  AsyncStorage.removeItem('harvest-test-user')
  ```

## Code Changes Made

1. **Login Screen** (`app/login.tsx`)
   - Added "Test Mode" button with flask icon
   - Creates mock user without Supabase
   - Saves to AsyncStorage

2. **Auth Store** (`stores/useAuthStore.ts`)
   - Added `isTestMode` state
   - Modified `initialize()` to check for test mode
   - Updated `logout()` to clear test data

3. **Auth Guard** (`components/AuthGuard.tsx`)
   - Handles test mode users differently
   - Skips Supabase profile checks for test users

## Benefits
- No email required
- No internet connection needed
- Instant access to test the app
- Perfect for development and demos
- Data persists between sessions

This test mode makes it much easier to develop and test the app without dealing with authentication issues!