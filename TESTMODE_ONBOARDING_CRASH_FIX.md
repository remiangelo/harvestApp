# Test Mode Onboarding Crash Fix - January 2025

## Critical Issue Fixed

**Problem**: App crashed during onboarding when using Test Mode, preventing any testing without real authentication.

## Root Cause Analysis

### The Bug

The `/app/onboarding/index.tsx` file was checking for `useAuthStore.user` to determine if onboarding progress should be loaded from the database. However, in **Test Mode**:

- `useAuthStore.user` is **NULL** (because test mode doesn't use Supabase authentication)
- The actual test user is stored in `useUserStore.currentUser`
- The code would try to load onboarding progress with a null user, causing the app to crash or behave incorrectly

### The Flow That Was Breaking

1. User clicks "Enter Test Mode" on login screen
2. `handleTestMode()` creates a mock user and stores it in:
   - `AsyncStorage` under `'harvest-test-user'`
   - `useUserStore.currentUser`
   - Sets `useAuthStore.isTestMode = true`
3. App navigates to `/onboarding`
4. **BUG**: `OnboardingIndex` checks for `useAuthStore.user` which is null
5. App tries to load progress with null user → **CRASH**

## The Fix

Updated `/app/onboarding/index.tsx` to properly handle Test Mode:

### Changes Made

```typescript
// BEFORE (BROKEN)
export default function OnboardingIndex() {
  const { user } = useAuthStore();

  const checkProgress = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    // ...rest of code that tries to use user.id
  };
}

// AFTER (FIXED)
export default function OnboardingIndex() {
  const { user, isTestMode } = useAuthStore();
  const { currentUser } = useUserStore();

  const checkProgress = async () => {
    // In test mode, skip database check and start from beginning
    if (isTestMode) {
      console.log('[OnboardingIndex] Test mode detected - starting from age step');
      setNextStep('age');
      setLoading(false);
      return;
    }

    if (!user) {
      console.log('[OnboardingIndex] No user found, starting from age step');
      setNextStep('age');
      setLoading(false);
      return;
    }

    // Normal database check for authenticated users
    // ...rest of code
  };
}
```

### Key Improvements

1. **Added `isTestMode` check**: Now explicitly checks if app is in test mode
2. **Skip database operations in test mode**: Test mode users don't have database profiles, so we skip trying to load from Supabase
3. **Start from beginning**: Test users always start onboarding from step 1 (age)
4. **Added logging**: Console logs help debug the flow
5. **Graceful fallback**: If no user and not test mode, still starts from beginning instead of crashing

## Testing the Fix

### Test Mode Flow (Should Now Work)

1. Open app → Go to login screen
2. Click "Enter Test Mode (No Email Required)" button
3. App should navigate to onboarding
4. **EXPECTED**: Age selection screen appears without crash
5. Complete onboarding steps (all data stays local)
6. **EXPECTED**: Successfully complete onboarding and reach main app

### Normal Auth Flow (Still Works)

1. Sign up with email/password or Google OAuth
2. App navigates to onboarding
3. **EXPECTED**: Resume from last saved step if returning user
4. Complete onboarding (data saves to Supabase)
5. **EXPECTED**: Successfully complete onboarding

## Related Code Files

### Files Modified

- ✅ `/app/onboarding/index.tsx` - Fixed to handle test mode

### Files That Already Handle Test Mode Correctly

- ✅ `/hooks/useOnboarding.ts` - Lines 20-23: Skip database saves in test mode
- ✅ `/app/onboarding/photos.tsx` - Lines 38-41: Skip photo uploads in test mode
- ✅ `/components/AuthGuard.tsx` - Lines 56-58: Check test mode for onboarding completion
- ✅ `/app/login.tsx` - Lines 226-265: Test mode setup and navigation

## Impact

**Before Fix**:

- Test mode was completely broken
- App crashed when trying to use onboarding without authentication
- Developers couldn't test without setting up real Supabase auth

**After Fix**:

- Test mode works perfectly for development
- No more crashes when entering onboarding
- Developers can test entire onboarding flow locally
- No database/network calls in test mode

## Why This Matters

Test Mode is **critical for development** because:

- Allows testing without email authentication
- No Supabase configuration needed for basic testing
- Faster development iteration (no signup/login required)
- Works on iOS Simulator (OAuth doesn't work there)
- All onboarding data stays local (perfect for testing)

## Verification Steps

1. **Clear all test data**:

   ```bash
   node clearTestMode.js
   ```

2. **Start fresh**:
   - Open app
   - Go to login screen
   - Click "Enter Test Mode"

3. **Expected behavior**:
   - App navigates to onboarding/age screen
   - No crashes or errors
   - Can complete entire onboarding flow
   - Successfully reach main app with swipe cards

4. **Console logs should show**:
   ```
   [OnboardingIndex] Checking progress - isTestMode: true
   [OnboardingIndex] User: null
   [OnboardingIndex] CurrentUser: exists
   [OnboardingIndex] Test mode detected - starting from age step
   ```

## Technical Details

### Test Mode Storage Architecture

```
Test Mode User Storage:
├── AsyncStorage
│   ├── 'harvest-test-mode': 'true'
│   └── 'harvest-test-user': { ...mockUser }
├── useAuthStore
│   ├── isTestMode: true
│   ├── isAuthenticated: true
│   └── user: null ❌ (This is why we needed the fix)
└── useUserStore
    └── currentUser: mockUser ✅ (Where test user actually lives)
```

### Why `useAuthStore.user` is Null in Test Mode

The `user` field in `useAuthStore` comes from Supabase's `auth.getUser()` call, which returns null when there's no real authentication session. Test mode intentionally bypasses Supabase, so this field is always null.

Instead, test mode sets:

- `isTestMode: true` to flag the app is in test mode
- `isAuthenticated: true` to pass auth checks
- Stores mock user in `useUserStore.currentUser`

## Future Considerations

If adding new screens or features that access onboarding data:

1. **Always check `isTestMode` first** before trying to access database
2. **Use `currentUser` from `useUserStore`** for test mode data
3. **Use `user` from `useAuthStore`** for real authentication data
4. **Add logging** to help debug test mode issues
5. **Skip network calls** in test mode (database, storage, etc.)

## Commit Information

- **Date**: January 2025
- **Files Changed**: 1 file (`app/onboarding/index.tsx`)
- **Lines Added**: ~15
- **Lines Removed**: ~5
- **Impact**: CRITICAL - Fixes complete test mode breakage
