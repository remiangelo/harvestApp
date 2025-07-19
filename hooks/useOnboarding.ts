import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/useAuthStore';
import useUserStore from '../stores/useUserStore';
import { saveOnboardingStep, completeOnboarding } from '../lib/onboarding';
import { Alert } from 'react-native';

export const useOnboarding = () => {
  const router = useRouter();
  const { user, loadProfile } = useAuthStore();
  const { updateOnboardingData, onboardingData } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);

  // Save current step data to both local store and database
  const saveStepData = useCallback(async (stepData: Record<string, any>) => {
    if (!user) {
      console.error('No user found, cannot save onboarding data');
      return { success: false, error: 'No user session' };
    }

    setIsSaving(true);
    
    try {
      // Update local store immediately for responsive UI
      updateOnboardingData(stepData);
      
      // Save to database
      const { error } = await saveOnboardingStep(user.id, stepData);
      
      if (error) {
        throw error;
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Error saving onboarding step:', error);
      Alert.alert(
        'Save Failed', 
        'Your progress could not be saved. You can continue, but your data may be lost if you close the app.',
        [{ text: 'OK' }]
      );
      return { success: false, error };
    } finally {
      setIsSaving(false);
    }
  }, [user, updateOnboardingData]);

  // Navigate to next step with optional data saving
  const goToNextStep = useCallback(async (
    currentStep: string,
    nextStep: string,
    stepData?: Record<string, any>
  ) => {
    // Save data if provided
    if (stepData) {
      const { success } = await saveStepData(stepData);
      // Continue even if save fails - user can complete onboarding
    }
    
    // Navigate to next step
    router.push(`/onboarding/${nextStep}` as any);
  }, [router, saveStepData]);

  // Complete onboarding and navigate to main app
  const finishOnboarding = useCallback(async () => {
    if (!user) {
      Alert.alert('Error', 'No user session found');
      return { success: false };
    }

    setIsSaving(true);

    try {
      // Mark onboarding as complete in database
      const { error } = await completeOnboarding(user.id);
      
      if (error) {
        throw error;
      }

      // Reload profile to update auth state
      await loadProfile(user.id);

      // Clear local onboarding data
      useUserStore.getState().clearOnboardingData();

      // Navigate to main app
      router.replace('/_tabs');
      
      return { success: true };
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert(
        'Error', 
        'Failed to complete onboarding. Please try again.',
        [{ text: 'OK' }]
      );
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  }, [user, loadProfile, router]);

  return {
    saveStepData,
    goToNextStep,
    finishOnboarding,
    isSaving,
    onboardingData,
  };
};