#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jutzlxdboayvmcuqwodn.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dHpseGRib2F5dm1jdXF3b2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTg4MTksImV4cCI6MjA2ODQ5NDgxOX0.SpsUKEH_pxCWVqoVYTsVOz9ULS9oAoz40CqMK-WJG4g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAuthSettings() {
  console.log('🔍 Checking current auth configuration...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
    });

    const settings = await response.json();

    console.log('📧 Email Auth Enabled:', settings.external.email ? '✅' : '❌');
    console.log(
      '🤖 Auto-confirm Enabled:',
      settings.mailer_autoconfirm ? '⚠️ YES (emails not sent)' : '✅ NO (emails sent)'
    );
    console.log('🚪 Signup Disabled:', settings.disable_signup ? '❌' : '✅ NO');

    if (settings.mailer_autoconfirm) {
      console.log('\n⚠️  WARNING: Auto-confirm is enabled!');
      console.log('   This means verification emails are NOT being sent.');
      console.log('   Users are automatically confirmed upon signup.');
      console.log('   To enable email verification for beta testing:');
      console.log('   1. Go to Supabase Dashboard > Auth > Configuration');
      console.log('   2. Set "Confirm email" to ENABLED');
      console.log('   3. Configure SMTP settings\n');
    }

    return settings;
  } catch (error) {
    console.error('❌ Error fetching auth settings:', error.message);
    return null;
  }
}

async function testSignUp() {
  const testEmail = `beta.test${Date.now()}@example.com`;
  const testPassword = 'BetaTest123!@#';

  console.log('🧪 Testing sign up flow...');
  console.log(`📧 Test email: ${testEmail}`);
  console.log(`🔑 Test password: ${testPassword.replace(/./g, '*')}\n`);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'harvestapp://auth/callback',
        data: {
          app_name: 'Harvest',
          signup_source: 'beta_test',
        },
      },
    });

    if (error) {
      console.error('❌ Sign up failed:', error.message);
      return;
    }

    if (data.user?.identities?.length === 0) {
      console.log('⚠️  User already exists with this email');
      return;
    }

    console.log('✅ Sign up successful!');
    console.log('   User ID:', data.user?.id);
    console.log('   Email:', data.user?.email);
    console.log(
      '   Email Confirmed:',
      data.user?.email_confirmed_at
        ? `Yes (at ${new Date(data.user.email_confirmed_at).toLocaleString()})`
        : 'No - awaiting verification'
    );
    console.log('   Created:', new Date(data.user?.created_at).toLocaleString());

    if (data.user?.email_confirmed_at) {
      console.log('\n⚠️  Email was auto-confirmed!');
      console.log('   This means email verification is NOT working.');
      console.log('   Users can log in immediately without verifying.');
    } else {
      console.log('\n✅ Email verification is required!');
      console.log('   User must check email and click verification link.');
      console.log('   They cannot log in until email is verified.');
    }

    // Try to log in immediately
    console.log('\n🔐 Testing immediate login (should fail if email not verified)...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (loginError) {
      if (loginError.message.includes('Email not confirmed')) {
        console.log('✅ Login blocked - email verification working correctly!');
      } else {
        console.log('⚠️  Login failed with error:', loginError.message);
      }
    } else if (loginData.user) {
      console.log('⚠️  Login succeeded without email verification!');
      console.log('   Auto-confirm is still enabled.');
    }

    // Clean up - sign out if logged in
    if (loginData?.session) {
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testResendVerification() {
  console.log('\n📨 Testing resend verification email...');

  const testEmail = 'existing.user@example.com'; // Use a real unverified email if you have one

  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: testEmail,
      options: {
        emailRedirectTo: 'harvestapp://auth/callback',
      },
    });

    if (error) {
      console.log('⚠️  Resend failed:', error.message);
      console.log("   This is normal if the email doesn't exist or is already verified.");
    } else {
      console.log('✅ Verification email resent successfully!');
    }
  } catch (error) {
    console.error('❌ Resend test failed:', error);
  }
}

// Main execution
async function main() {
  console.log('====================================');
  console.log('  Harvest App Email Verification Test');
  console.log('====================================\n');

  const settings = await checkAuthSettings();

  if (settings) {
    console.log('\n====================================\n');
    await testSignUp();
    await testResendVerification();
  }

  console.log('\n====================================');
  console.log('  Test Complete');
  console.log('====================================\n');

  console.log('📋 Next Steps:');
  if (settings?.mailer_autoconfirm) {
    console.log('1. ⚠️  CRITICAL: Disable auto-confirm in Supabase Dashboard');
    console.log('2. 📧 Set up SMTP provider (Resend or SendGrid)');
    console.log('3. 🔄 Run this test again to verify emails are being sent');
  } else {
    console.log('1. ✅ Email verification is configured');
    console.log('2. 📧 Make sure SMTP is properly configured');
    console.log('3. 🧪 Test with real email addresses');
  }
}

main().catch(console.error);
