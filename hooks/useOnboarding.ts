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
          throw error;
        }

        console.log('[saveStepData] Save successful');
        return { success: true, error: null };
      } catch (error) {
        console.error('[saveStepData] Error saving onboarding step:', error);
        Alert.alert(
          'Save Failed',
          `Your progress could not be saved. Error: ${error instanceof Error ? error.message : 'Unknown error'}. You can continue, but your data may be lost if you close the app.`,
          [{ text: 'OK' }]
        );
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

      // Navigate to main app
      router.replace('/_tabs');
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
        throw error;
      }

      console.log('[finishOnboarding] Onboarding marked complete, reloading profile...');

      // CRITICAL: Wait for profile to load before navigating
      // This prevents race condition where AuthGuard checks profile before it's updated
      await loadProfile(user.id);

      console.log('[finishOnboarding] Profile reloaded successfully');

      // Clear local onboarding data
      useUserStore.getState().clearOnboardingData();

      console.log('[finishOnboarding] Navigating to main app...');

      // Navigate to main app
      router.replace('/_tabs');

      console.log('[finishOnboarding] Navigation complete');
      return { success: true };
    } catch (error) {
      console.error('[finishOnboarding] Error completing onboarding:', error);
      Alert.alert(
        'Error',
        `Failed to complete onboarding: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        [{ text: 'OK' }]
      );
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
