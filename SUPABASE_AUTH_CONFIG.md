# Supabase Authentication Configuration Guide

## Production Email Authentication Setup

### 1. Email Settings in Supabase Dashboard

Go to your Supabase project dashboard (https://app.supabase.com) and configure:

#### Authentication > Email Templates

1. **Confirm Signup**: Customize the email users receive to verify their account
2. **Magic Link**: For passwordless login (optional)
3. **Change Email**: When users update their email
4. **Reset Password**: Password recovery emails

#### Authentication > URL Configuration

Add these redirect URLs:

- `harvest://auth/callback` (for mobile app)
- `https://harvest-app.com/auth/callback` (for web, if applicable)
- `com.harvest.harvestdating://auth/callback` (iOS specific)

### 2. Email Provider Settings

#### For Development/Testing (Current Setup):

- **Auto-confirm emails**: ENABLED ✅
- Uses Supabase's built-in email service
- Limited to 3 emails per hour per address

#### For Production:

1. Go to **Settings > Auth**
2. Disable "Enable email confirmations" for instant access OR
3. Keep enabled and configure a proper email provider:

##### Option A: Resend (Recommended)

```
1. Create account at https://resend.com
2. Get API key
3. In Supabase: Settings > Auth > SMTP Settings
4. Enable "Enable Custom SMTP"
5. Add Resend SMTP details:
   - Host: smtp.resend.com
   - Port: 465
   - Username: resend
   - Password: [Your Resend API Key]
   - Sender email: noreply@yourdomain.com
```

##### Option B: SendGrid

```
1. Create SendGrid account
2. Get API key
3. Configure in Supabase SMTP settings
```

### 3. OAuth Providers (Google & Facebook)

#### Google OAuth Setup:

1. Go to https://console.cloud.google.com
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add redirect URIs:
   - `https://jutzlxdboayvmcuqwodn.supabase.co/auth/v1/callback`
6. Copy Client ID and Secret to Supabase Dashboard:
   - Authentication > Providers > Google

#### Facebook OAuth Setup:

1. Go to https://developers.facebook.com
2. Create new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs:
   - `https://jutzlxdboayvmcuqwodn.supabase.co/auth/v1/callback`
5. Copy App ID and Secret to Supabase Dashboard:
   - Authentication > Providers > Facebook

### 4. Current Configuration Status

✅ **Working Now:**

- Email/password signup (auto-confirmed)
- Email/password login
- Basic auth flow

❌ **Needs Configuration:**

- Custom email templates
- Production email provider (for > 3 emails/hour)
- Google OAuth credentials
- Facebook OAuth credentials

### 5. Testing Authentication

Test the current setup:

```bash
# Test signup
curl -X POST 'https://jutzlxdboayvmcuqwodn.supabase.co/auth/v1/signup' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Test login
curl -X POST 'https://jutzlxdboayvmcuqwodn.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

### 6. App Configuration

The app is configured with:

- ✅ Proper redirect URLs for email confirmation
- ✅ OAuth redirect handling
- ✅ Production-ready auth flow
- ✅ Error handling and logging

### 7. Important Security Notes

1. **Rate Limits**: Default Supabase has 3 emails/hour limit
2. **Email Confirmation**: Currently disabled for testing
3. **Password Requirements**: Minimum 6 characters (can be increased)
4. **Session Management**: 1 hour access token, auto-refresh enabled

### 8. Next Steps for Production

1. [ ] Configure custom SMTP provider
2. [ ] Set up OAuth providers (Google, Facebook)
3. [ ] Customize email templates with branding
4. [ ] Enable email confirmation requirement
5. [ ] Set up password strength requirements
6. [ ] Configure rate limiting rules
7. [ ] Set up auth webhooks for user events
