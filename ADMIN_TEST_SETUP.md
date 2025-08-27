# Admin Test Setup for Harvest App

## Test Accounts Available

### 1. Admin Account (Test Mode - No Email Required)

The easiest way to test the app as an admin is using **Test Mode**:

1. Run the app in development mode
2. On the login screen, click **"Enter Test Mode"**
3. This creates a local test user without needing email verification
4. You'll be taken directly to onboarding

### 2. Email-Based Admin Account

If you want to test with real email authentication:

**Email:** admin@harvest.com  
**Password:** admin123456

To create this account in your Supabase instance:

```sql
-- Run this in your Supabase SQL editor
-- First, create the auth user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'admin@harvest.com',
  crypt('admin123456', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Then create the user profile
INSERT INTO users (
  id,
  nickname,
  email,
  onboarding_completed,
  created_at,
  updated_at
)
SELECT
  id,
  'Admin User',
  'admin@harvest.com',
  true,
  now(),
  now()
FROM auth.users
WHERE email = 'admin@harvest.com';
```

### 3. Regular Test User Account

**Email:** test@harvest.com  
**Password:** test123456

```sql
-- Create regular test user
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test@harvest.com',
  crypt('test123456', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now()
);

-- Create profile for test user
INSERT INTO users (
  id,
  nickname,
  email,
  onboarding_completed,
  created_at,
  updated_at
)
SELECT
  id,
  'Test User',
  'test@harvest.com',
  false,
  now(),
  now()
FROM auth.users
WHERE email = 'test@harvest.com';
```

## Email Verification Configuration

### Current Setup

- **Development Mode**: Email verification is **bypassed** in Test Mode
- **Production Mode**: Email verification is handled by Supabase

### Supabase Email Settings

1. Go to your Supabase dashboard
2. Navigate to **Authentication > Email Templates**
3. Email verification is enabled by default
4. Users receive a confirmation email upon signup

### To Disable Email Verification (Development)

In Supabase Dashboard:

1. Go to **Authentication > Providers > Email**
2. Toggle off "Confirm email"

### To Test Email Verification

1. Sign up with a real email address
2. Check your inbox for the verification email
3. Click the verification link
4. You'll be redirected back to the app

## Quick Testing Flow

### For Immediate Testing (Recommended)

1. Launch the app: `npm start`
2. Click **"Enter Test Mode"** on login screen
3. Complete onboarding
4. Test all features

### For Email Authentication Testing

1. Ensure Supabase is configured with your project URL and anon key
2. Sign up with a real email or use the SQL above to create test accounts
3. If email verification is enabled, check your email
4. Login with credentials

## Features Available to Admin

When logged in as admin (role: 'admin'):

- Access to all app features
- View safety dashboard with all user reports
- Access to moderation tools (when implemented)
- Bypass certain restrictions

## Troubleshooting

### "Invalid email or password"

- Ensure the test accounts are created in your Supabase instance
- Check that passwords are at least 6 characters
- Verify Supabase connection in `.env` file

### Email verification not working

- Check Supabase email settings
- Ensure SMTP is configured (or use Supabase's default)
- Check spam folder for verification emails

### Test Mode not working

- Ensure you're running in development mode (`__DEV__` is true)
- Clear AsyncStorage if having issues: `npm run clear-cache`
- Check console for error messages

## Environment Variables Required

```bash
# .env file
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# For AI features (optional)
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key
```

## Testing Checklist

- [ ] Test Mode login works
- [ ] Email signup creates account
- [ ] Email verification (if enabled) sends email
- [ ] Login with email/password works
- [ ] Onboarding flow completes
- [ ] Profile data saves correctly
- [ ] Navigation between screens works
- [ ] Swipe functionality works
- [ ] Chat features work
- [ ] Settings can be updated
- [ ] Logout works correctly
