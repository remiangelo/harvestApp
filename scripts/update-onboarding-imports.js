#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// List of onboarding files to update
const onboardingFiles = [
  'location.tsx',
  'gender.tsx',
  'goals.tsx',
  'distance.tsx',
  'hobbies.tsx',
  'photos.tsx',
  'nickname.tsx',
  'bio.tsx',
  'preferences.tsx'
];

const onboardingDir = path.join(__dirname, '..', 'app', 'onboarding');

onboardingFiles.forEach(file => {
  const filePath = path.join(onboardingDir, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace useUser import
    content = content.replace(
      "import { useUser } from '../../context/UserContext';",
      "import useUserStore from '../../stores/useUserStore';"
    );
    
    // Replace useUser hook usage
    content = content.replace(
      'const { currentUser, updateOnboardingData } = useUser();',
      'const { currentUser, updateOnboardingData } = useUserStore();'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${file}`);
  } else {
    console.log(`❌ File not found: ${file}`);
  }
});

console.log('\n🎉 All onboarding files updated!');