# Critical Authentication & Onboarding Issues - January 20, 2025

## Issues Reported

1. **Email Signup**: Shows "Invalid login credentials" error when trying to sign up
2. **Google OAuth**: "Failed to save" on each onboarding step + app crashes on sexuality selection

## Root Cause Analysis

### Issue 1: Email Signup "Invalid login credentials"

**Investigation findings:**

- Error message is misleading - "Invalid login credentials" during SIGNUP (not login)
- Possible causes:
  1. Email already exists in system (duplicate signup attempt)
  2. Supabase email confirmation is required but not properly handled
  3. Profile creation fails silently after auth account creation
  4. RLS policies may be blocking profile INSERT operations

**Code inspection:**

- `useAuthStore.register()` creates profile using `createProfile()` directly
- Does NOT use `ensureProfileExists()` helper that we created
- If profile creation fails, user has auth account but no database profile
- Subsequent login attempts fail because profile is missing

### Issue 2: Google OAuth "Failed to save" + Crash

**Investigation findings:**

- `ensureProfileExists()` is called in `lib/onboarding.ts` for onboarding saves
- `ensureProfileExists()` is called in `app/_layout.tsx` OAuth callback
- BUT: There's a race condition and error handling issues

**Specific problems identified:**

1. **OAuth Callback Timing**:

```typescript
// app/_layout.tsx lines 203-214
await ensureProfileExists(data.user.id);
await loadProfile(data.user.id);
```

- This runs BEFORE onboarding starts
- If it fails, error is logged but user continues anyway
- Onboarding then tries to save without a profile

2. **Onboarding Save Process**:

```typescript
// lib/onboarding.ts
const { email } = await ensureProfileExists(userId);
// Then UPSERT with email
```

- If `ensureProfileExists()` throws, the whole function errors
- User sees generic "Save Failed" alert
- No indication of what actually failed

3. **Profile Creation RLS**:

- Users table has RLS enabled
- We never checked if RLS policies ALLOW users to INSERT their own profiles
- Authenticated users might not have INSERT permission

### Issue 3: Sexuality Selection Crash

**Analysis:**

- Crash happens on LAST step of onboarding (preferences/sexuality)
- This triggers `completeOnboarding()` which updates `onboarding_completed = true`
- If this fails, app tries to navigate anyway → crash
- Likely same root cause: profile doesn't exist or RLS blocks UPDATE

## Required Fixes

### Fix 1: Update Register Function to Use ensureProfileExists

**File**: `stores/useAuthStore.ts`

Change from:

```typescript
const profileResult = await createProfile(data.user.id, email);
```

To:

```typescript
const { ensureProfileExists } = await import('../lib/profileHelpers');
await ensureProfileExists(data.user.id);
```

### Fix 2: Add Comprehensive Error Handling

**Files**: `lib/onboarding.ts`, `hooks/useOnboarding.ts`

1. Wrap ALL async operations in try-catch
2. Provide specific error messages for different failure modes
3. Add retry logic with exponential backoff
4. Check RLS permissions explicitly

### Fix 3: Create or Update RLS Policies

**SQL to run in Supabase**:

```sql
-- Allow users to INSERT their own profile
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to UPDATE their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to SELECT their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);
```

### Fix 4: Add Better Signup Error Messages

**File**: `app/login.tsx`

Change generic "Signup Failed" to specific messages:

- "This email is already registered. Please sign in instead."
- "Failed to create profile. Please try again."
- "Please check your email to verify your account."

### Fix 5: Add Profile Existence Check Before Onboarding

**File**: `components/AuthGuard.tsx`

Before starting onboarding, verify profile exists:

```typescript
if (user && !profile) {
  // Profile missing - try to create it
  await ensureProfileExists(user.id);
}
```

## Testing Plan

1. **Test Email Signup**:
   - [ ] Fresh signup with new email
   - [ ] Signup with existing email (should show proper error)
   - [ ] Complete full onboarding flow
   - [ ] Verify profile created in database

2. **Test Google OAuth**:
   - [ ] OAuth signup with new Google account
   - [ ] OAuth login with existing Google account
   - [ ] Complete full onboarding flow
   - [ ] Verify no "Save Failed" errors
   - [ ] Verify no crash on sexuality selection

3. **Test RLS Policies**:
   - [ ] Verify user can INSERT their own profile
   - [ ] Verify user can UPDATE their own profile
   - [ ] Verify user can SELECT their own profile
   - [ ] Verify user CANNOT modify other users' profiles

## Implementation Order

1. ✅ Create this documentation
2. ⏳ Add/verify RLS policies in Supabase
3. ⏳ Update register function in useAuthStore
4. ⏳ Improve error handling in onboarding
5. ⏳ Add specific error messages in login screen
6. ⏳ Test all signup/onboarding flows
7. ⏳ Update CLAUDE.md memory with fixes

## Expected Impact

- Email signup will work correctly with clear error messages
- OAuth signup will create profiles reliably
- Onboarding will save data successfully every time
- No more crashes on sexuality selection
- Users will understand exactly what went wrong if issues occur
