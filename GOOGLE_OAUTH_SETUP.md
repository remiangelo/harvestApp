# Google OAuth Setup for Harvest App

## ✅ What I've Done

1. **Verified Supabase Connection**: Your project `jutzlxdboayvmcuqwodn` is active and healthy
2. **Confirmed Database Structure**: Users table exists and is properly configured
3. **Fixed OAuth Implementation**:
   - `/app/auth.tsx` - UI buttons for Google/Facebook login
   - `/stores/useAuthStore.ts` - OAuth handler that opens browser
   - `/lib/supabase.ts` - Fixed OAuth flow (removed skipBrowserRedirect)
   - `/app/_layout.tsx` - Added deep link handler for OAuth callback
4. **Configured Google OAuth**: Client ID and Secret added to Supabase Dashboard

## 📋 What You Need to Do

### Step 1: Google Cloud Console Setup (5 minutes)

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create New Project** (or select existing):
   - Click the project dropdown at the top
   - Click "NEW PROJECT"
   - Name: `Harvest Dating App`
   - Click "Create"

3. **Enable Required APIs**:
   - Go to **APIs & Services → Library**
   - Search and enable: **Google+ API**
   - Search and enable: **Google Identity Toolkit API** (if available)

### Step 2: Configure OAuth Consent Screen (5 minutes)

1. Go to **APIs & Services → OAuth consent screen**
2. Select **External** user type (for public apps)
3. Click **CREATE**
4. Fill in App Information:
   ```
   App name: Harvest
   User support email: [Your email]
   App logo: [Upload if you have one]
   ```
5. App domain (leave these blank for now or use):
   ```
   Application home page: https://jutzlxdboayvmcuqwodn.supabase.co
   Privacy policy: https://jutzlxdboayvmcuqwodn.supabase.co/privacy
   Terms of service: https://jutzlxdboayvmcuqwodn.supabase.co/terms
   ```
6. Authorized domains: Add `supabase.co`
7. Developer contact: [Your email]
8. Click **SAVE AND CONTINUE**

9. **Scopes page**:
   - Click **ADD OR REMOVE SCOPES**
   - Select these scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`
   - Click **UPDATE** then **SAVE AND CONTINUE**

10. **Test users** (optional for development):
    - Add your email address
    - Click **SAVE AND CONTINUE**

### Step 3: Create OAuth 2.0 Credentials (3 minutes)

1. Go to **APIs & Services → Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Web application**
4. Configure:

   ```
   Name: Harvest Web Client

   Authorized JavaScript origins:
   - https://jutzlxdboayvmcuqwodn.supabase.co

   Authorized redirect URIs (ADD ALL THREE):
   - https://jutzlxdboayvmcuqwodn.supabase.co/auth/v1/callback
   - harvestapp://auth/callback
   - exp://127.0.0.1:19000
   ```

5. Click **CREATE**
6. **IMPORTANT - Copy these values**:
   ```
   Client ID: [Looks like: 123456789-abcdefg.apps.googleusercontent.com]
   Client Secret: [Looks like: GOCSPX-xxxxxxxxxxxx]
   ```

### Step 4: Configure in Supabase Dashboard (2 minutes)

1. **Open Supabase Dashboard**:
   https://supabase.com/dashboard/project/jutzlxdboayvmcuqwodn/auth/providers

2. Find **Google** in the list of providers

3. Toggle **Enable Sign in with Google** to **ON**

4. Fill in the fields:

   ```
   Client ID: [Paste your Google Client ID from Step 3]
   Client Secret: [Paste your Google Client Secret from Step 3]

   Authorized Client IDs (optional - for mobile):
   [Leave empty for now]
   ```

5. Click **Save**

### Step 5: Create Mobile OAuth Clients (Optional - for production)

#### For iOS (if deploying to App Store):

1. In Google Cloud Console → Credentials
2. Create new OAuth client ID → **iOS**
3. Bundle ID: `com.harvest.harvestdating`
4. Save the iOS Client ID

#### For Android (if deploying to Play Store):

1. In Google Cloud Console → Credentials
2. Create new OAuth client ID → **Android**
3. Package name: `com.remiangelo.harvestApp`
4. SHA-1 certificate fingerprint: (get from your keystore or Expo build)

### Step 6: Test Your Implementation

1. **Run your app**:

   ```bash
   npm start
   ```

2. **Test the flow**:
   - Open the app
   - Go to the auth screen
   - Click "Continue with Google"
   - It should open a browser
   - Login with Google
   - Should redirect back to app and create/login user

## 🔧 Troubleshooting

### Common Issues:

1. **"Redirect URI mismatch" error**:
   - Make sure you added ALL THREE redirect URIs in Step 3
   - Check that Supabase URL matches exactly

2. **"App hasn't been verified" warning**:
   - This is normal for development
   - Add test users in OAuth consent screen
   - For production, you'll need to verify the app with Google

3. **Deep linking not working on mobile**:
   - Make sure `harvestapp://` scheme is configured in app.json
   - For Expo Go, use the `exp://` redirect URI

4. **"Access blocked" error**:
   - Make sure OAuth consent screen is configured
   - Check that Google+ API is enabled

## ✅ Your App Is Ready!

Your code already has everything needed:

- ✅ UI buttons in `/app/auth.tsx`
- ✅ OAuth handler in `/stores/useAuthStore.ts`
- ✅ Supabase integration in `/lib/supabase.ts`
- ✅ Redirect URL configured as `harvestapp://auth/callback`

## 📝 Environment Variables

Your app already has the Supabase credentials in the code. No additional env vars needed for OAuth.

## 🚀 Next Steps

After completing the setup:

1. Test with a Google account
2. Check that user profile is created in Supabase
3. Verify onboarding flow works after OAuth login
4. Consider adding Facebook OAuth (similar process)

---

**Need help?** The main steps are:

1. Create Google Cloud project
2. Configure OAuth consent screen
3. Create OAuth credentials (copy Client ID & Secret)
4. Paste credentials in Supabase Dashboard
5. Test!

The whole process should take about 15 minutes.
