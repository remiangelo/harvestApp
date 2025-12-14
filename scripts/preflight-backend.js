#!/usr/bin/env node
'use strict';
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const results = { passed: 0, failed: 0, warnings: 0 };
function pass(msg) {
  console.log(`✅ ${msg}`);
  results.passed++;
}
function fail(msg, detail) {
  console.log(`❌ ${msg}${detail ? `: ${detail}` : ''}`);
  results.failed++;
}
function warn(msg, detail) {
  console.log(`⚠️  ${msg}${detail ? `: ${detail}` : ''}`);
  results.warnings++;
}

console.log('🧪 Backend Preflight: Supabase configuration and schema checks\n');

if (!supabaseUrl || !anonKey) {
  fail('Environment', 'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
} else {
  pass('Environment variables present');
}

const supabase = supabaseUrl && anonKey ? createClient(supabaseUrl, anonKey) : null;
const supabaseAdmin = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

(async () => {
  // Connectivity check
  if (!supabase) {
    fail('Supabase client', 'Cannot create client without credentials');
  } else {
    try {
      // Light call that should not error even without session
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      pass('Connected to Supabase (auth.getSession succeeded)');
    } catch (e) {
      fail('Supabase connectivity', e.message);
    }
  }

  // Migrations duplicates
  try {
    const migDir = path.join(process.cwd(), 'supabase', 'migrations');
    const files = fs.readdirSync(migDir).filter((f) => f.endsWith('.sql'));
    if (files.length === 0) {
      warn('Migrations', 'No migration files found');
    } else {
      pass(`Found ${files.length} migration files`);
      const prefixes = files.map((f) => f.split('_')[0]);
      const dups = prefixes.filter((p, i) => prefixes.indexOf(p) !== i);
      if (dups.length) {
        warn('Duplicate migration numbers', dups.join(', '));
      }
    }
  } catch (e) {
    warn('Migrations check', e.message);
  }

  // Code consistency: profiles vs users
  try {
    const supaFile = path.join(process.cwd(), 'lib', 'supabase.ts');
    if (fs.existsSync(supaFile)) {
      const content = fs.readFileSync(supaFile, 'utf-8');
      if (content.includes("from('profiles'") || content.includes('from("profiles"')) {
        warn(
          'Profiles table referenced in lib/supabase.ts',
          'App schema uses users table; normalize usage'
        );
      } else {
        pass('User profile table reference consistent (users)');
      }
    }
  } catch (e) {
    warn('Code consistency check', e.message);
  }

  // Table existence checks (best-effort under RLS)
  async function tableExists(table) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error && error.code === '42P01') return false; // undefined table
      return true; // either ok or blocked by RLS
    } catch (e) {
      if (e.code === '42P01') return false;
      return true;
    }
  }

  const requiredTables = ['users', 'swipes', 'matches', 'messages'];
  const optionalTables = ['conversations', 'photos', 'user_preferences'];
  for (const t of requiredTables) {
    const exists = supabase ? await tableExists(t) : false;
    if (exists) pass(`Table exists: ${t}`);
    else fail(`Missing table: ${t}`);
  }
  for (const t of optionalTables) {
    const exists = supabase ? await tableExists(t) : false;
    if (exists) pass(`Table exists (optional): ${t}`);
    else warn(`Optional table not found`, t);
  }

  // RPC function existence
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('get_match_status', {
        user_a: '00000000-0000-0000-0000-000000000000',
        user_b: '00000000-0000-0000-0000-000000000001',
      });
      if (
        error &&
        (error.code === '42883' ||
          (error.message &&
            error.message.includes('function') &&
            error.message.includes('does not exist')))
      ) {
        fail('RPC get_match_status', 'Function not found');
      } else {
        pass('RPC function present: get_match_status');
      }
    } catch (e) {
      warn('RPC check get_match_status', e.message);
    }
  }

  // Storage bucket check
  if (supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.storage.listBuckets();
      if (error) throw error;
      const hasBucket = (data || []).some((b) => b.name === 'profile-photos');
      if (hasBucket) pass('Storage bucket exists: profile-photos');
      else fail('Missing storage bucket: profile-photos');
    } catch (e) {
      warn('Storage bucket check (admin)', e.message);
    }
  } else if (supabase) {
    try {
      // Try listing root; may fail under anon if not public
      const { data, error } = await supabase.storage.from('profile-photos').list('', { limit: 1 });
      if (error) {
        warn(
          'Storage bucket visibility',
          'Cannot confirm bucket with anon key (this can be normal). Ensure bucket exists.'
        );
      } else {
        pass('Storage bucket accessible: profile-photos');
      }
    } catch (e) {
      warn('Storage bucket check (anon)', e.message);
    }
  }

  // RLS sanity: anon insert should be denied
  if (supabase) {
    try {
      const { error } = await supabase.from('swipes').insert({
        swiper_id: '00000000-0000-0000-0000-000000000000',
        swiped_id: '00000000-0000-0000-0000-000000000001',
        action: 'like',
      });
      if (!error) {
        warn('RLS', 'Anon insert into swipes succeeded; RLS may be too permissive');
      } else {
        pass('RLS denies anon insert into swipes (expected)');
      }
    } catch (e) {
      pass('RLS denies anon insert into swipes (expected)');
    }
  }

  // Summary
  console.log('\n📊 Preflight Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  if (results.failed > 0) {
    console.log('\n⚠️  One or more critical checks failed. See messages above.');
    process.exit(1);
  } else {
    console.log('\n🎉 Backend preflight checks passed (with warnings if any).');
  }
})();
