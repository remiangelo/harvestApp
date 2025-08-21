# Production Authentication Setup Guide

## 1. OAuth Setup - Google

### Step 1: Create Google Cloud Project

1. Go to https://console.cloud.google.com
2. Click "Select a project" → "New Project"
3. Name it "Harvest Dating App"
4. Wait for project creation

### Step 2: Configure OAuth Consent Screen

1. In Google Cloud Console, go to **APIs & Services** → **OAuth consent screen**
2. Choose "External" user type
3. Fill in required fields:
   - **App name**: Harvest
   - **User support email**: Your email
   - **App logo**: Upload your app icon
   - **Application home page**: https://harvest-app.com (or your website)
   - **Privacy policy**: https://harvest-app.com/privacy
   - **Terms of service**: https://harvest-app.com/terms
   - **Developer contact**: Your email
4. Add scopes:
   - Click "Add or Remove Scopes"
   - Select: `email`, `profile`, `openid`
5. Add test users (optional during development)
6. Save and continue

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: "Harvest Supabase Auth"
5. Add Authorized redirect URIs:
   ```
   https://jutzlxdboayvmcuqwodn.supabase.co/auth/v1/callback
   ```
6. Click **Create**
7. Copy your credentials:
   - **Client ID**: (looks like: xxxxx.apps.googleusercontent.com)
   - **Client Secret**: (keep this secure!)

### Step 4: Add to Supabase

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and click to expand
5. Toggle **Enable Sign in with Google**
6. Paste your:
   - Client ID (from Google)
   - Client Secret (from Google)
7. Click **Save**

---

## 2. OAuth Setup - Facebook

### Step 1: Create Facebook App

1. Go to https://developers.facebook.com
2. Click **My Apps** → **Create App**
3. Choose **Consumer** as app type
4. Fill in:
   - **App name**: Harvest Dating
   - **App contact email**: Your email
   - **App purpose**: "Dating app for meaningful connections"

### Step 2: Add Facebook Login

1. In your app dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Choose **Web** (even though it's mobile, Supabase uses web flow)
4. Site URL: `https://jutzlxdboayvmcuqwodn.supabase.co`

### Step 3: Configure Facebook Login Settings

1. Go to **Facebook Login** → **Settings**
2. Add to **Valid OAuth Redirect URIs**:
   ```
   https://jutzlxdboayvmcuqwodn.supabase.co/auth/v1/callback
   ```
3. Enable these settings:
   - Client OAuth Login: **Yes**
   - Web OAuth Login: **Yes**
   - Enforce HTTPS: **Yes**
4. Save Changes

### Step 4: Get App Credentials

1. Go to **Settings** → **Basic**
2. Copy:
   - **App ID**: (numeric ID)
   - **App Secret**: (click Show and copy)

### Step 5: Add to Supabase

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Facebook** and click to expand
5. Toggle **Enable Sign in with Facebook**
6. Paste your:
   - App ID (from Facebook)
   - App Secret (from Facebook)
7. Click **Save**

### Step 6: Submit for Facebook Review (For Production)

1. In Facebook App Dashboard, go to **App Review**
2. Toggle your app to **Live** mode
3. Request permissions:
   - `email` (required)
   - `public_profile` (required)
4. Complete Data Use Checkup
5. Submit for review (usually takes 1-3 days)

---

## 3. SMTP Email Provider Setup (Resend - Recommended)

### Step 1: Create Resend Account

1. Go to https://resend.com
2. Sign up for free account (100 emails/day free)
3. Verify your email

### Step 2: Verify Your Domain

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `harvest-app.com` (or your domain)
4. Add DNS records to your domain:
   - They'll show you exactly what to add
   - Usually SPF, DKIM, and DMARC records
5. Click **Verify Domain** (may take up to 48 hours)

### Step 3: Create API Key

1. Go to **API Keys**
2. Click **Create API Key**
3. Name: "Supabase SMTP"
4. Permission: **Sending access**
5. Copy the API key (starts with `re_`)

### Step 4: Configure Supabase SMTP

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **Auth**
4. Scroll to **SMTP Settings**
5. Toggle **Enable Custom SMTP**
6. Fill in:
   ```
   Host: smtp.resend.com
   Port: 465
   Username: resend
   Password: [Your Resend API Key from Step 3]
   Sender email: noreply@harvest-app.com (or noreply@yourdomain.com)
   Sender name: Harvest
   ```
7. Click **Save**

### Step 5: Customize Email Templates

1. Still in **Settings** → **Auth**
2. Scroll to **Email Templates**
3. Customize each template:

**Confirm Signup Template:**

```html
<h2>Welcome to Harvest! 🌱</h2>
<p>Hi there,</p>
<p>Thanks for joining Harvest - where meaningful connections grow.</p>
<p>Please confirm your email to get started:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>This link will expire in 24 hours.</p>
<p>Happy matching!<br />The Harvest Team</p>
```

**Reset Password Template:**

```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>We received a request to reset your Harvest password.</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can ignore this email.</p>
<p>This link will expire in 1 hour.</p>
<p>Best,<br />The Harvest Team</p>
```

---

## 4. Email Confirmation Settings

### Option A: Keep Auto-Confirm (Testing/Beta)

**Current Setting - Good for TestFlight**

1. In Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Keep **Confirm email** = OFF
3. Users can sign up and immediately use the app

### Option B: Require Email Confirmation (Production)

**Recommended for App Store Release**

1. In Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Set **Confirm email** = ON
3. Additional settings:
   - **Double confirm email changes**: ON (recommended)
   - **Secure email change**: ON (requires password)

### Update App Code for Email Confirmation

When you enable email confirmation, the app already handles it:

- Shows "Check Your Email" message after signup
- User must click email link before logging in
- Email link redirects to: `harvestapp://auth/callback`

---

## 5. Testing Your Setup

### Test Google OAuth:

```bash
curl -X POST https://jutzlxdboayvmcuqwodn.supabase.co/auth/v1/authorize \
  -H "apikey: YOUR_ANON_KEY" \
  -d "provider=google"
```

### Test Facebook OAuth:

```bash
curl -X POST https://jutzlxdboayvmcuqwodn.supabase.co/auth/v1/authorize \
  -H "apikey: YOUR_ANON_KEY" \
  -d "provider=facebook"
```

### Test Email Sending:

1. Sign up with a real email
2. Check if email arrives within 1-2 minutes
3. Check spam folder if not in inbox

---

## 6. Production Checklist

### Before TestFlight:

- [ ] Keep auto-confirm ON (easier testing)
- [ ] SMTP optional (3 emails/hour is enough)
- [ ] OAuth optional (can add later)

### Before App Store:

- [ ] Enable email confirmation
- [ ] Configure SMTP (Resend or SendGrid)
- [ ] Add Google OAuth
- [ ] Add Facebook OAuth
- [ ] Test with real emails
- [ ] Customize all email templates
- [ ] Add rate limiting rules

### Cost Estimates:

- **Resend**: Free up to 100 emails/day, then $20/month for 10,000 emails
- **Google OAuth**: Free
- **Facebook OAuth**: Free
- **Supabase**: Free tier includes auth, $25/month Pro for more features

---

## 7. Common Issues & Solutions

### Issue: OAuth redirect not working

**Solution**: Make sure redirect URL in provider matches exactly:

```
https://jutzlxdboayvmcuqwodn.supabase.co/auth/v1/callback
```

### Issue: Emails going to spam

**Solution**:

1. Verify domain properly
2. Add SPF, DKIM, DMARC records
3. Use a reputable sender domain
4. Avoid spam trigger words

### Issue: Facebook app stuck in development

**Solution**:

1. Complete Data Use Checkup
2. Add Privacy Policy URL
3. Add Terms of Service URL
4. Submit for App Review

### Issue: Google OAuth shows "unverified app" warning

**Solution**:

1. Complete OAuth consent screen fully
2. Add all required URLs
3. Submit for Google verification (if >100 users)

---

## Support Resources

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Resend Docs**: https://resend.com/docs
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Facebook Login**: https://developers.facebook.com/docs/facebook-login

---

## Quick Start (Minimum for TestFlight)

You can launch on TestFlight with just:

1. ✅ Current auto-confirm emails
2. ✅ No OAuth (add later)
3. ✅ Default Supabase email (3/hour limit)

This guide helps you add the rest when ready for scale!
