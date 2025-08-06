#!/usr/bin/env node

// This script contains the updates needed for each onboarding screen
// It's provided as a reference for manual updates

const onboardingScreenUpdates = {
  'preferences.tsx': {
    imports: `import { useOnboarding } from '../../hooks/useOnboarding';`,
    hookUsage: `const { goToNextStep, isSaving } = useOnboarding();`,
    handleContinue: `
  const handleContinue = async () => {
    if (selected) {
      await goToNextStep('preferences', 'bio', { preferences: selected });
    }
  };`,
    buttonUpdate: `
        <TouchableOpacity 
          style={[styles.button, (!selected || isSaving) && styles.buttonDisabled]} 
          onPress={handleContinue} 
          disabled={!selected || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>`,
  },

  'bio.tsx': {
    handleContinue: `
  const handleContinue = async () => {
    if (bio.trim()) {
      await goToNextStep('bio', 'nickname', { bio: bio.trim() });
    }
  };`,
  },

  'nickname.tsx': {
    handleContinue: `
  const handleContinue = async () => {
    if (nickname.trim()) {
      await goToNextStep('nickname', 'photos', { nickname: nickname.trim() });
    }
  };`,
  },

  'photos.tsx': {
    handleContinue: `
  const handleContinue = async () => {
    const validPhotos = photos.filter(photo => photo !== null);
    if (validPhotos.length > 0) {
      await goToNextStep('photos', 'hobbies', { photos: validPhotos });
    }
  };`,
  },

  'hobbies.tsx': {
    handleContinue: `
  const handleContinue = async () => {
    if (selectedHobbies.length > 0) {
      await goToNextStep('hobbies', 'distance', { hobbies: selectedHobbies });
    }
  };`,
  },

  'distance.tsx': {
    handleContinue: `
  const handleContinue = async () => {
    await goToNextStep('distance', 'goals', { distance });
  };`,
  },

  'goals.tsx': {
    handleContinue: `
  const handleContinue = async () => {
    if (selected) {
      await goToNextStep('goals', 'gender', { goals: selected });
    }
  };`,
  },

  'gender.tsx': {
    handleContinue: `
  const handleContinue = async () => {
    if (selected) {
      await goToNextStep('gender', 'location', { gender: selected });
    }
  };`,
  },

  'location.tsx': {
    handleAllowLocation: `
  const handleAllowLocation = async () => {
    const location = currentUser?.location || 'San Francisco, CA';
    await goToNextStep('location', 'complete', { location });
  };`,
  },
};

console.log(`
To update each onboarding screen:

1. Add the import:
   import { ActivityIndicator } from 'react-native';
   import { useOnboarding } from '../../hooks/useOnboarding';

2. Replace useUserStore hook usage with:
   const { currentUser } = useUserStore();
   const { goToNextStep, isSaving } = useOnboarding();

3. Update the handleContinue/handleAllowLocation function with the async version

4. Update the button to show loading state

5. Add buttonDisabled style:
   buttonDisabled: {
     opacity: 0.7,
   },
`);

export {};
