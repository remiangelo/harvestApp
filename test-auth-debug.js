#!/usr/bin/env node

/**
 * Debug authentication issues
 * Run: node test-auth-debug.js
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jutzlxdboayvmcuqwodn.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dHpseGRib2F5dm1jdXF3b2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTg4MTksImV4cCI6MjA2ODQ5NDgxOX0.SpsUKEH_pxCWVqoVYTsVOz9ULS9oAoz40CqMK-WJG4g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testAuth() {
  console.log('\n🔍 Testing Supabase Authentication\n');
  console.log('='.repeat(60));

  // Test 1: Connection to Supabase
  console.log('\n1️⃣ Testing Supabase Connection...');
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.log('   ❌ Database connection failed:', error.message);
    } else {
      console.log('   ✅ Database connection successful');
    }
  } catch (err) {
    console.log('   ❌ Connection error:', err.message);
  }

  // Test 2: Create a test account
  const testEmail = `test_${Date.now()}@harvest.com`;
  const testPassword = 'TestPassword123!';

  console.log('\n2️⃣ Testing Account Creation...');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);

  try {
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signupError) {
      console.log('   ❌ Signup failed:', signupError.message);
      console.log('   Error details:', JSON.stringify(signupError, null, 2));
    } else {
      console.log('   ✅ Account created successfully');
      console.log('   User ID:', signupData.user?.id);
      console.log('   Email confirmed:', signupData.user?.email_confirmed_at ? 'Yes' : 'No');
      console.log(
        '   Session:',
        signupData.session ? 'Created' : 'Not created (email confirmation required)'
      );

      // Test 3: Create profile in users table
      if (signupData.user) {
        console.log('\n3️⃣ Creating User Profile...');
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert({
            id: signupData.user.id,
            email: testEmail,
            nickname: 'Test User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (profileError) {
          console.log('   ❌ Profile creation failed:', profileError.message);
          console.log('   Error details:', JSON.stringify(profileError, null, 2));
        } else {
          console.log('   ✅ Profile created successfully');
        }
      }

      // Test 4: Try to login
      console.log('\n4️⃣ Testing Login...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (loginError) {
        console.log('   ❌ Login failed:', loginError.message);
        console.log('   Error details:', JSON.stringify(loginError, null, 2));
      } else {
        console.log('   ✅ Login successful');
        console.log('   Session token:', loginData.session?.access_token ? 'Present' : 'Missing');
        console.log('   User ID:', loginData.user?.id);
      }
    }
  } catch (err) {
    console.log('   ❌ Unexpected error:', err.message);
  }

  // Test 5: Try existing admin account
  console.log('\n5️⃣ Testing Admin Account Login...');
  try {
    const { data: adminLogin, error: adminError } = await supabase.auth.signInWithPassword({
      email: 'admin@harvest.com',
      password: 'admin123456',
    });

    if (adminError) {
      console.log('   ❌ Admin login failed:', adminError.message);
      console.log(
        '   Note: You may need to create the admin account using the SQL in ADMIN_TEST_SETUP.md'
      );
    } else {
      console.log('   ✅ Admin login successful');
    }
  } catch (err) {
    console.log('   ❌ Error:', err.message);
  }

  // Test 6: Check auth configuration
  console.log('\n6️⃣ Checking Auth Configuration...');
  console.log('   Supabase URL:', SUPABASE_URL);
  console.log('   Anon Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  console.log('If signup works but login fails with "Invalid credentials":');
  console.log('  → Email confirmation may be required');
  console.log('  → Check Supabase Dashboard > Authentication > Settings');
  console.log('  → Disable "Confirm email" for testing\n');

  console.log('If AsyncStorage errors occur in the app:');
  console.log('  → The fix has been applied to lib/supabase.ts');
  console.log('  → Restart the Metro bundler: npm start --reset-cache');
  console.log('  → Clear app data on device/simulator\n');

  console.log('To use Test Mode (bypass all auth):');
  console.log('  → Click "Enter Test Mode" on login screen');
  console.log('  → No email or Supabase required\n');
}

testAuth().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
