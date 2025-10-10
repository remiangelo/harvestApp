# Email Verification Setup for Beta Testing

## Current Status

- **Email Auth**: ✅ Enabled
- **Auto-confirm**: ⚠️ Currently ON (emails not being sent)
- **Project**: harvestApp (jutzlxdboayvmcuqwodn)

## Required Steps for Email Verification

### 1. Configure SMTP Provider in Supabase Dashboard

Go to: https://supabase.com/dashboard/project/jutzlxdboayvmcuqwodn/auth/configuration

#### Option A: Resend (Recommended for Beta)

1. Sign up at https://resend.com (free tier: 100 emails/day)
2. Get your API key
3. In Supabase Dashboard > Auth > Email Configuration:
   - Enable "Custom SMTP"
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: `[Your Resend API Key]`
   - Sender email: `noreply@yourdomain.com`
   - Sender name: `Harvest`

#### Option B: SendGrid

1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Create an API key with "Mail Send" permissions
3. In Supabase Dashboard > Auth > Email Configuration:
   - Enable "Custom SMTP"
   - Host: `smtp.sendgrid.net`
   - Port: `465`
   - Username: `apikey`
   - Password: `[Your SendGrid API Key]`
   - Sender email: `noreply@yourdomain.com`
   - Sender name: `Harvest`

### 2. Disable Auto-Confirm

In Supabase Dashboard > Auth > Email Configuration:

1. Find "Confirm email" setting
2. Set to **"Enabled"** (this disables auto-confirm)
3. Save changes

### 3. Update Email Templates (Optional)

In Supabase Dashboard > Auth > Email Templates:

- Customize the confirmation email template
- Update subject line: "Welcome to Harvest - Verify Your Email"
- Add your branding and messaging

### 4. Configure Redirect URLs

In Supabase Dashboard > Auth > URL Configuration:

1. Site URL: `harvestapp://`
2. Redirect URLs (add these):
   - `harvestapp://auth/callback`
   - `harvestapp://auth/confirm`
   - `harvestapp://auth/reset`

## Testing Email Verification

### Quick Test Script

```javascript
// Run: node test-email-verification.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://jutzlxdboayvmcuqwodn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dHpseGRib2F5dm1jdXF3b2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTg4MTksImV4cCI6MjA2ODQ5NDgxOX0.SpsUKEH_pxCWVqoVYTsVOz9ULS9oAoz40CqMK-WJG4g'
);

async function testEmailVerification() {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  console.log('🧪 Testing email verification...');
  console.log(`📧 Test email: ${testEmail}`);

  // Sign up
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      emailRedirectTo: 'harvestapp://auth/callback',
    },
  });

  if (error) {
    console.error('❌ Sign up failed:', error.message);
    return;
  }

  if (data.user?.identities?.length === 0) {
    console.log('⚠️ User already exists');
    return;
  }

  console.log('✅ Sign up successful');
  console.log('📬 Check email for verification link');
  console.log('User ID:', data.user?.id);
  console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');

  // If auto-confirm is still on, this will be true immediately
  if (data.user?.email_confirmed_at) {
    console.log('⚠️ Auto-confirm is still enabled - emails not being sent!');
    console.log('👉 Please disable auto-confirm in Supabase Dashboard');
  } else {
    console.log('✅ Email verification required - check inbox!');
  }
}

testEmailVerification();
```

## App Code Updates Required

### 1. Update Login Screen

The login screen should handle unverified emails:

```typescript
// app/login.tsx - Add to handleLogin function
if (data.user && !data.user.email_confirmed_at) {
  Alert.alert(
    'Verify Your Email',
    'Please check your email and click the verification link to continue.',
    [{ text: 'OK' }]
  );
  return;
}
```

### 2. Add Resend Verification Option

```typescript
// Add resend verification function
const resendVerification = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: 'harvestapp://auth/callback',
    },
  });

  if (!error) {
    Alert.alert('Email Sent', 'Verification email has been resent.');
  }
};
```

## Verification Flow

1. User signs up with email/password
2. Supabase sends verification email
3. User clicks link in email
4. Link redirects to `harvestapp://auth/callback`
5. App handles callback and confirms user
6. User can now log in

## Important Notes

⚠️ **For Beta Testing**:

- You MUST set up SMTP to send emails
- Auto-confirm must be DISABLED
- Test with real email addresses
- Monitor email delivery rates

📱 **Mobile Deep Linking**:

- iOS: Configured in Info.plist
- Android: Configured in AndroidManifest.xml
- Both use `harvestapp://` scheme

## Monitoring

Check email stats in Supabase Dashboard:

- Auth > Logs (see email send attempts)
- Auth > Users (check email_confirmed_at field)

## Troubleshooting

### Emails not sending?

1. Check SMTP configuration is correct
2. Verify API keys are valid
3. Check spam folders
4. Look at Auth logs in Supabase Dashboard

### Users can't verify?

1. Check redirect URLs are configured
2. Verify deep linking is working
3. Check email template has correct links

### Need to test without emails?

Keep auto-confirm ON during development, turn OFF for beta/production.
