# Onboarding Database Integration Guide

## Overview
This guide documents the integration of real-time database saving into the onboarding flow. Each step now saves data to Supabase as users progress.

## Architecture

### Key Components

1. **`lib/onboarding.ts`**
   - `saveOnboardingStep()` - Saves data after each screen
   - `completeOnboarding()` - Marks profile as complete
   - `getOnboardingProgress()` - Retrieves saved progress

2. **`hooks/useOnboarding.ts`**
   - Provides unified interface for all onboarding screens
   - Handles loading states and error handling
   - Manages navigation between steps

3. **`components/OnboardingScreen.tsx`**
   - Wrapper component for consistent UI
   - Handles progress bar, buttons, and loading states
   - Reduces code duplication across screens

## Implementation Status

### ✅ Completed
- Created onboarding service layer
- Created useOnboarding hook
- Created OnboardingScreen wrapper component
- Updated age.tsx to save to database
- Updated preferences.tsx to use wrapper
- Updated complete.tsx to use new hook

### 🔄 In Progress
- Updating remaining onboarding screens

## Data Flow

1. User enters data on each screen
2. When "Continue" is pressed:
   - Data is validated locally
   - Saved to Zustand store (immediate UI update)
   - Saved to Supabase (persistent storage)
   - Navigation occurs even if save fails
3. On app restart:
   - User's progress is restored from database
   - They continue from where they left off

## Screen Update Pattern

Each onboarding screen needs these changes:

```typescript
// 1. Update imports
import { OnboardingScreen } from '../../components/OnboardingScreen';
import useUserStore from '../../stores/useUserStore';

// 2. Remove router and update hooks
const { currentUser } = useUserStore();

// 3. Create validation function
const handleValidate = () => {
  if (/* validation logic */) {
    return { fieldName: fieldValue };
  }
  return null;
};

// 4. Wrap content in OnboardingScreen
return (
  <OnboardingScreen
    progress={60} // Progress percentage
    currentStep="bio"
    nextStep="nickname"
    onValidate={handleValidate}
    buttonDisabled={!bio.trim()}
  >
    {/* Screen content */}
  </OnboardingScreen>
);
```

## Data Transformations

### Age
- Input: Date object from date picker
- Stored as: Number (calculated age in years)

### Photos
- Input: Local URIs from image picker
- Stored as: Array of Supabase Storage URLs

### Distance
- Input: `distance` from slider
- Stored as: `distance_preference` in database

## Error Handling

- Save failures show alert but don't block progress
- Users can complete onboarding offline
- Data syncs when connection restored

## Testing

1. **New User Flow**
   ```bash
   # Create new account
   # Complete each onboarding step
   # Verify data saves in Supabase dashboard
   ```

2. **Resume Flow**
   ```bash
   # Start onboarding
   # Force close app mid-flow
   # Reopen and verify progress restored
   ```

3. **Offline Mode**
   ```bash
   # Enable airplane mode
   # Complete onboarding
   # Re-enable network
   # Verify data syncs
   ```

## Next Steps

1. Update remaining screens (bio through location)
2. Add progress restoration on app launch
3. Implement photo upload to Supabase Storage
4. Add offline queue for failed saves
5. Create admin dashboard for user analytics