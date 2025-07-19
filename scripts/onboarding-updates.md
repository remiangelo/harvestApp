# Onboarding Screen Updates

## bio.tsx (60% progress)
```typescript
// Replace imports and component structure
import { OnboardingScreen } from '../../components/OnboardingScreen';

// In component:
const handleValidate = () => {
  if (bio.trim()) {
    return { bio: bio.trim() };
  }
  return null;
};

return (
  <OnboardingScreen
    progress={60}
    currentStep="bio"
    nextStep="nickname"
    onValidate={handleValidate}
    buttonDisabled={!bio.trim()}
  >
    <Text style={styles.title}>Describe Your True Self!</Text>
    <Text style={styles.subtitle}>Add a bio to your profile so people get to know you before swiping!</Text>
    <TextInput
      style={styles.input}
      placeholder="I'm a person that loves...."
      placeholderTextColor="#888"
      value={bio}
      onChangeText={setBio}
      multiline
      numberOfLines={5}
      textAlignVertical="top"
    />
  </OnboardingScreen>
);
```

## nickname.tsx (70% progress)
```typescript
const handleValidate = () => {
  if (nickname.trim()) {
    return { nickname: nickname.trim() };
  }
  return null;
};

return (
  <OnboardingScreen
    progress={70}
    currentStep="nickname"
    nextStep="photos"
    onValidate={handleValidate}
    buttonDisabled={!nickname.trim()}
  >
    {/* Content */}
  </OnboardingScreen>
);
```

## photos.tsx (80% progress)
```typescript
const handleValidate = () => {
  const validPhotos = photos.filter(photo => photo !== null);
  if (validPhotos.length > 0) {
    return { photos: validPhotos };
  }
  return null;
};

return (
  <OnboardingScreen
    progress={80}
    currentStep="photos"
    nextStep="hobbies"
    onValidate={handleValidate}
    buttonDisabled={photos.filter(p => p !== null).length === 0}
  >
    {/* Photo grid */}
  </OnboardingScreen>
);
```

## hobbies.tsx (90% progress)
```typescript
const handleValidate = () => {
  if (selectedHobbies.length > 0) {
    return { hobbies: selectedHobbies };
  }
  return null;
};

return (
  <OnboardingScreen
    progress={90}
    currentStep="hobbies"
    nextStep="distance"
    onValidate={handleValidate}
    buttonDisabled={selectedHobbies.length === 0}
  >
    {/* Hobbies list */}
  </OnboardingScreen>
);
```

## distance.tsx (100% progress)
```typescript
const handleValidate = () => {
  return { distance };
};

return (
  <OnboardingScreen
    progress={100}
    currentStep="distance"
    nextStep="goals"
    onValidate={handleValidate}
  >
    {/* Slider */}
  </OnboardingScreen>
);
```

## goals.tsx (100% progress)
```typescript
const handleValidate = () => {
  if (selected) {
    return { goals: selected };
  }
  return null;
};

return (
  <OnboardingScreen
    progress={100}
    currentStep="goals"
    nextStep="gender"
    onValidate={handleValidate}
    buttonDisabled={!selected}
  >
    {/* Options */}
  </OnboardingScreen>
);
```

## gender.tsx (100% progress)
```typescript
const handleValidate = () => {
  if (selected) {
    return { gender: selected };
  }
  return null;
};

return (
  <OnboardingScreen
    progress={100}
    currentStep="gender"
    nextStep="location"
    onValidate={handleValidate}
    buttonDisabled={!selected}
  >
    {/* Options */}
  </OnboardingScreen>
);
```

## location.tsx (100% progress)
```typescript
// Special case - uses different button
const handleValidate = () => {
  const location = currentUser?.location || 'San Francisco, CA';
  return { location };
};

return (
  <OnboardingScreen
    progress={100}
    currentStep="location"
    nextStep="complete"
    onValidate={handleValidate}
    buttonText="Allow Location"
  >
    <View style={styles.iconContainer}>
      <Ionicons name="location" size={48} color="#8B1E2D" />
    </View>
    <Text style={styles.title}>Enable Location</Text>
    <Text style={styles.subtitle}>You need to enable location to be able to use Harvest</Text>
  </OnboardingScreen>
);
```