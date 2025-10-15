import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/useAuthStore';
import useUserStore from '../stores/useUserStore';
import { saveOnboardingStep, completeOnboarding } from '../lib/onboarding';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DemoUser } from '../data/demoUsers';

export const useOnboarding = () => {
  const router = useRouter();
  const { user, loadProfile, isTestMode } = useAuthStore();
  const { updateOnboardingData, onboardingData, currentUser } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);

  // Save current step data to both local store and database
  const saveStepData = useCallback(
    async (stepData: Record<string, any>) => {
      // In test mode, only save to local store
      if (isTestMode) {
        updateOnboardingData(stepData);
        return { success: true, error: null };
      }

      if (!user) {
        console.error('[saveStepData] No user found, cannot save onboarding data');
        return { success: false, error: 'No user session' };
      }

      setIsSaving(true);

      try {
        // Update local store immediately for responsive UI
        updateOnboardingData(stepData);

        console.log('[saveStepData] Saving step data for user:', user.id);
        console.log('[saveStepData] User email:', user.email);

        // Save to database - pass user email for UPSERT
        const { error } = await saveOnboardingStep(user.id, stepData, user.email);

        if (error) {
          console.error('[saveStepData] Save error:', error);

          // Extract user-friendly error message
          const errorObj = error as any;
          const errorMessage =
            errorObj && typeof errorObj === 'object' && 'message' in errorObj
              ? errorObj.message
              : 'Failed to save your information. Please check your internet connection and try again.';

          Alert.alert('Save Failed', errorMessage, [
            { text: 'Continue Anyway' },
            {
              text: 'Retry',
              onPress: () => saveStepData(stepData),
            },
          ]);
          return { success: false, error };
        }

        console.log('[saveStepData] Save successful');
        return { success: true, error: null };
      } catch (error) {
        console.error('[saveStepData] Error saving onboarding step:', error);

        // Extract user-friendly error message
        const errorMessage =
          typeof error === 'object' && error !== null && 'message' in error
            ? (error as any).message
            : error instanceof Error
              ? error.message
              : 'Your progress could not be saved. Please check your internet connection and try again.';

        Alert.alert('Save Failed', errorMessage, [
          { text: 'Continue Anyway' },
          {
            text: 'Retry',
            onPress: () => saveStepData(stepData),
          },
        ]);
        return { success: false, error };
      } finally {
        setIsSaving(false);
      }
    },
    [user, updateOnboardingData, isTestMode]
  );

  // Navigate to next step with optional data saving
  const goToNextStep = useCallback(
    async (currentStep: string, nextStep: string, stepData?: Record<string, any>) => {
      try {
        // Save data if provided
        if (stepData) {
          const { success } = await saveStepData(stepData);
          // Continue even if save fails - user can complete onboarding
        }

        // Navigate to next step
        router.push(`/onboarding/${nextStep}` as any);
      } catch (error) {
        console.error('Error in goToNextStep:', error);
        // Still try to navigate even if there's an error
        try {
          router.push(`/onboarding/${nextStep}` as any);
        } catch (navError) {
          console.error('Navigation error:', navError);
          Alert.alert(
            'Navigation Error',
            'There was an error moving to the next step. Please try restarting the app.',
            [{ text: 'OK' }]
          );
        }
      }
    },
    [router, saveStepData]
  );

  // Complete onboarding and navigate to main app
  const finishOnboarding = useCallback(async () => {
    console.log('[finishOnboarding] Starting onboarding completion');

    // In test mode, just update local state
    if (isTestMode) {
      console.log('[finishOnboarding] Test mode - updating local state');
      // Update the current user to mark onboarding as complete
      const updatedUser = { ...currentUser, onboardingCompleted: true };
      useUserStore.getState().setCurrentUser(updatedUser as DemoUser);

      // Update AsyncStorage
      try {
        await AsyncStorage.setItem('harvest-test-user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('[finishOnboarding] Error updating test user:', error);
      }

      // CRITICAL: Wait for state to propagate to AuthGuard
      // AuthGuard will automatically navigate when it detects onboarding is complete
      console.log('[finishOnboarding] Waiting for state propagation to AuthGuard...');
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('[finishOnboarding] State updated - AuthGuard will handle navigation');
      // DO NOT navigate here - let AuthGuard handle it to avoid conflicts
      return { success: true };
    }

    if (!user) {
      console.error('[finishOnboarding] No user session found');
      Alert.alert('Error', 'No user session found');
      return { success: false };
    }

    setIsSaving(true);

    try {
      console.log('[finishOnboarding] Completing onboarding for user:', user.id);

      // Mark onboarding as complete in database
      const { error } = await completeOnboarding(user.id);

      if (error) {
        console.error('[finishOnboarding] Complete onboarding error:', error);

        // Extract user-friendly error message
        const errorObj = error as any;
        const errorMessage =
          errorObj && typeof errorObj === 'object' && 'message' in errorObj
            ? errorObj.message
            : 'Failed to complete onboarding. Please check your internet connection and try again.';

        Alert.alert('Onboarding Failed', errorMessage, [
          { text: 'Cancel' },
          {
            text: 'Try Again',
            onPress: () => finishOnboarding(),
          },
        ]);
        return { success: false };
      }

      console.log('[finishOnboarding] Onboarding marked complete, reloading profile...');

      // CRITICAL: Wait for profile to load before AuthGuard navigation
      // This prevents race condition where AuthGuard checks profile before it's updated
      try {
        await loadProfile(user.id);
        console.log('[finishOnboarding] Profile reloaded successfully');

        // Clear local onboarding data
        useUserStore.getState().clearOnboardingData();

        // Wait for state to propagate to AuthGuard
        // AuthGuard will detect onboarding_completed=true and navigate automatically
        console.log('[finishOnboarding] Waiting for state propagation to AuthGuard...');
        await new Promise((resolve) => setTimeout(resolve, 500));

        console.log('[finishOnboarding] State updated - AuthGuard will handle navigation');
        // DO NOT navigate here - let AuthGuard handle it to avoid conflicts
        return { success: true };
      } catch (loadError) {
        console.error('[finishOnboarding] Failed to load profile:', loadError);

        Alert.alert(
          'Profile Load Failed',
          'Your onboarding is complete but we could not load your profile. Please restart the app.',
          [{ text: 'OK' }]
        );
        return { success: false };
      }
    } catch (error) {
      console.error('[finishOnboarding] Unexpected error completing onboarding:', error);

      // Extract user-friendly error message
      const errorObj = error as any;
      const errorMessage =
        errorObj && typeof errorObj === 'object' && 'message' in errorObj
          ? errorObj.message
          : 'An unexpected error occurred. Please try again.';

      Alert.alert('Onboarding Failed', errorMessage, [
        { text: 'Cancel' },
        {
          text: 'Try Again',
          onPress: () => finishOnboarding(),
        },
      ]);
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  }, [user, loadProfile, router, isTestMode, currentUser]);

  return {
    saveStepData,
    goToNextStep,
    finishOnboarding,
    isSaving,
    onboardingData,
  };
};
