#!/usr/bin/env node

/**
 * Test Google OAuth Setup for Harvest App
 * Run this after configuring Google OAuth to verify everything works
 */

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const SUPABASE_URL = 'https://jutzlxdboayvmcuqwodn.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dHpseGRib2F5dm1jdXF3b2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTg4MTksImV4cCI6MjA2ODQ5NDgxOX0.SpsUKEH_pxCWVqoVYTsVOz9ULS9oAoz40CqMK-WJG4g';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testGoogleOAuth() {
  console.log('🔍 Testing Google OAuth Setup for Harvest App\n');
  console.log('📍 Supabase URL:', SUPABASE_URL);
  console.log('-------------------------------------------\n');

  try {
    // Test 1: Check if Supabase is reachable
    console.log('1️⃣  Testing Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (healthError && healthError.code !== 'PGRST116') {
      console.error('❌ Supabase connection failed:', healthError.message);
      return;
    }
    console.log('✅ Supabase connection successful!\n');

    // Test 2: Generate OAuth URL
    console.log('2️⃣  Generating Google OAuth URL...');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'harvestapp://auth/callback',
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error('❌ OAuth URL generation failed:', error.message);
      console.log('\n⚠️  This usually means:');
      console.log('   - Google provider is not enabled in Supabase');
      console.log('   - Client ID/Secret not configured');
      return;
    }

    if (data?.url) {
      console.log('✅ OAuth URL generated successfully!\n');
      console.log('📱 OAuth URL for testing:');
      console.log('-------------------------------------------');
      console.log(data.url);
      console.log('-------------------------------------------\n');

      console.log('📋 What to do next:');
      console.log('1. Copy the URL above');
      console.log('2. Open it in a browser');
      console.log('3. You should see Google login page');
      console.log('4. After login, it should redirect to harvestapp://auth/callback');
      console.log('5. Your app should handle this redirect\n');

      console.log('🔍 URL Components:');
      const url = new URL(data.url);
      console.log('   - Provider: Google');
      console.log('   - Redirect URI:', url.searchParams.get('redirect_uri'));
      console.log('   - Response Type:', url.searchParams.get('response_type'));
      console.log('   - Scopes:', url.searchParams.get('scope'));
    }

    // Test 3: Check for test configuration
    console.log('\n3️⃣  Configuration Checklist:');
    console.log('-------------------------------------------');
    console.log('Make sure you have completed:');
    console.log('☐ Google Cloud Console project created');
    console.log('☐ OAuth consent screen configured');
    console.log('☐ OAuth 2.0 credentials created');
    console.log('☐ Client ID & Secret added to Supabase');
    console.log('☐ Redirect URIs added:');
    console.log('  - https://jutzlxdboayvmcuqwodn.supabase.co/auth/v1/callback');
    console.log('  - harvestapp://auth/callback');
    console.log('  - exp://127.0.0.1:19000 (for Expo development)');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
console.log('🚀 Starting Google OAuth Test...\n');
testGoogleOAuth().then(() => {
  console.log('\n✨ Test complete!');
  console.log('-------------------------------------------');
  console.log('If all tests passed, your Google OAuth is ready!');
  console.log('If not, check the GOOGLE_OAUTH_SETUP.md for troubleshooting.');
});
