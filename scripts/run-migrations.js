#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigrations() {
  // Check for environment variables
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials');
    console.log('Please create a .env file with:');
    console.log('EXPO_PUBLIC_SUPABASE_URL=your_url');
    console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key');
    process.exit(1);
  }

  console.log('🚀 Connecting to Supabase...');
  
  // Note: For migrations, you typically need a service role key
  // This script shows the structure, but you'll need to run SQL via dashboard
  console.log('\n📋 Migration file location:');
  console.log(path.join(__dirname, '../supabase/migrations/001_initial_schema.sql'));
  
  console.log('\n📝 To run the migration:');
  console.log('1. Go to your Supabase Dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the contents of 001_initial_schema.sql');
  console.log('4. Click "Run" to execute the migration');
  
  console.log('\n💡 Alternatively, use Supabase CLI:');
  console.log('npm install -g supabase');
  console.log('supabase link --project-ref your-project-ref');
  console.log('supabase db push');
}

runMigrations();