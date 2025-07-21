#!/usr/bin/env node

/**
 * Harvest App Functionality Test Suite
 * This script tests major functionality without actually running the app
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Running Harvest App Functionality Tests...\n');

const tests = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function testPass(name) {
  console.log(`✅ ${name}`);
  tests.passed++;
}

function testFail(name, error) {
  console.log(`❌ ${name}: ${error}`);
  tests.failed++;
}

function testWarn(name, warning) {
  console.log(`⚠️  ${name}: ${warning}`);
  tests.warnings++;
}

// Test 1: Check if .env file exists
console.log('1️⃣  Environment Configuration Tests');
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  if (envContent.includes('EXPO_PUBLIC_SUPABASE_URL') && envContent.includes('EXPO_PUBLIC_SUPABASE_ANON_KEY')) {
    testPass('Environment variables configured');
  } else {
    testFail('Environment variables', 'Missing required Supabase keys');
  }
} else {
  testFail('Environment file', '.env file not found');
}

// Test 2: Check critical imports
console.log('\n2️⃣  Import Dependency Tests');
const criticalFiles = [
  'app/_layout.tsx',
  'app/_tabs/index.tsx',
  'components/CleanSwipeCard.tsx',
  'stores/useAuthStore.ts',
  'lib/supabase.ts'
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Check for common import errors
    if (content.includes('import') && !content.includes('// @ts-ignore')) {
      testPass(`${file} imports look valid`);
    } else if (content.includes('// @ts-ignore')) {
      testWarn(`${file}`, 'Contains @ts-ignore comments');
    }
  } else {
    testFail(`${file}`, 'File not found');
  }
});

// Test 3: Check image URLs
console.log('\n3️⃣  Image Loading Tests');
const profilesFile = fs.readFileSync('data/betterDemoProfiles.ts', 'utf-8');
const unsplashPattern = /https:\/\/images\.unsplash\.com\/photo-[^'"\s]+/g;
const matches = profilesFile.match(unsplashPattern) || [];

if (matches.length > 0) {
  testPass(`Found ${matches.length} Unsplash image URLs`);
  
  // Check if URLs have proper parameters
  const properUrls = matches.filter(url => 
    url.includes('ixlib=') && 
    url.includes('auto=format') && 
    url.includes('fit=crop')
  );
  
  if (properUrls.length === matches.length) {
    testPass('All image URLs have proper parameters');
  } else {
    testWarn('Image URLs', `${matches.length - properUrls.length} URLs missing proper parameters`);
  }
} else {
  testFail('Image URLs', 'No Unsplash URLs found in demo profiles');
}

// Test 4: Gesture Handler Configuration
console.log('\n4️⃣  Gesture Handler Tests');
const layoutFile = fs.readFileSync('app/_layout.tsx', 'utf-8');
if (layoutFile.includes('GestureHandlerRootView')) {
  testPass('GestureHandlerRootView is configured');
} else {
  testFail('Gesture Handler', 'GestureHandlerRootView not found in root layout');
}

// Test 5: Error Boundary Implementation
console.log('\n5️⃣  Error Handling Tests');
const swipeScreenFile = fs.readFileSync('app/_tabs/index.tsx', 'utf-8');
if (swipeScreenFile.includes('<ErrorBoundary>')) {
  testPass('ErrorBoundary wraps swipe screen');
} else {
  testFail('Error Boundary', 'Swipe screen not wrapped in ErrorBoundary');
}

// Test 6: Navigation Structure
console.log('\n6️⃣  Navigation Tests');
const navigationFiles = [
  'app/auth.tsx',
  'app/login.tsx',
  'app/onboarding/index.tsx',
  'app/onboarding/complete.tsx',
  'app/_tabs/_layout.tsx'
];

navigationFiles.forEach(file => {
  if (fs.existsSync(file)) {
    testPass(`${file} exists`);
  } else {
    testFail(`Navigation`, `${file} not found`);
  }
});

// Test 7: State Management
console.log('\n7️⃣  State Management Tests');
const authStoreFile = fs.readFileSync('stores/useAuthStore.ts', 'utf-8');
if (authStoreFile.includes('isTestMode')) {
  testPass('Test mode support in auth store');
} else {
  testFail('Test Mode', 'isTestMode not found in auth store');
}

// Test 8: Database Schema
console.log('\n8️⃣  Database Schema Tests');
const migrationFiles = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql'));
if (migrationFiles.length > 0) {
  testPass(`Found ${migrationFiles.length} migration files`);
  
  // Check for duplicate migration numbers
  const migrationNumbers = migrationFiles.map(f => f.split('_')[0]);
  const duplicates = migrationNumbers.filter((num, idx) => migrationNumbers.indexOf(num) !== idx);
  
  if (duplicates.length > 0) {
    testWarn('Migrations', `Duplicate migration numbers: ${duplicates.join(', ')}`);
  }
} else {
  testFail('Database', 'No migration files found');
}

// Test 9: Swipe Functionality
console.log('\n9️⃣  Swipe Card Tests');
const swipeCardFile = fs.readFileSync('components/CleanSwipeCard.tsx', 'utf-8');
if (swipeCardFile.includes('try {') && swipeCardFile.includes('catch')) {
  testPass('Swipe card has error handling');
} else {
  testFail('Swipe Card', 'Missing try-catch error handling');
}

if (swipeCardFile.includes('runOnJS')) {
  testPass('Swipe card uses proper animation callbacks');
} else {
  testFail('Swipe Card', 'Missing runOnJS for animation callbacks');
}

// Test 10: Component Cleanup
console.log('\n🔟 Component Cleanup Tests');
const componentFiles = fs.readdirSync('components').filter(f => f.endsWith('.tsx'));
const unusedComponents = componentFiles.filter(f => {
  const content = fs.readFileSync(path.join('components', f), 'utf-8');
  return content.includes('// UNUSED');
});

if (unusedComponents.length > 0) {
  testWarn('Components', `${unusedComponents.length} components marked as UNUSED: ${unusedComponents.join(', ')}`);
}

// Summary
console.log('\n📊 Test Summary:');
console.log(`✅ Passed: ${tests.passed}`);
console.log(`❌ Failed: ${tests.failed}`);
console.log(`⚠️  Warnings: ${tests.warnings}`);

const totalScore = (tests.passed / (tests.passed + tests.failed)) * 100;
console.log(`\n🎯 Overall Score: ${totalScore.toFixed(1)}%`);

if (tests.failed === 0) {
  console.log('\n🎉 All critical tests passed!');
} else {
  console.log('\n⚠️  Some tests failed. Please fix the issues above.');
  process.exit(1);
}