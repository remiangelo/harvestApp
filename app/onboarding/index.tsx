import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../stores/useAuthStore';
import { getOnboardingProgress } from '../../lib/onboarding';
import useUserStore from '../../stores/useUserStore';
import { theme } from '../../constants/theme';

export default function OnboardingIndex() {
  const [loading, setLoading] = useState(true);
  const [nextStep, setNextStep] = useState<string>('age');
  const { user, isTestMode } = useAuthStore();
  const { updateOnboardingData, currentUser } = useUserStore();

  useEffect(() => {
    checkProgress();
  }, [user, isTestMode, currentUser]);

  const checkProgress = async () => {
    console.log('[OnboardingIndex] Checking progress - isTestMode:', isTestMode);
    console.log('[OnboardingIndex] User:', user ? 'exists' : 'null');
    console.log('[OnboardingIndex] CurrentUser:', currentUser ? 'exists' : 'null');

    // In test mode, skip database check and start from beginning
    if (isTestMode) {
      console.log('[OnboardingIndex] Test mode detected - starting from age step');
      setNextStep('age');
      setLoading(false);
      return;
    }

    if (!user) {
      console.log('[OnboardingIndex] No user found, starting from age step');
      setNextStep('age');
      setLoading(false);
      return;
    }

    try {
      const { currentStep, data } = await getOnboardingProgress(user.id);

      // Restore saved onboarding data
      if (data) {
        const restoredData: any = {};

        // Map database fields to local state
        if (data.age) restoredData.age = data.age;
        if (data.preferences) restoredData.preferences = data.preferences;
        if (data.sexual_orientation) restoredData.sexual_orientation = data.sexual_orientation;
        if (data.bio) restoredData.bio = data.bio;
        if (data.nickname) restoredData.nickname = data.nickname;
        if (data.photos) restoredData.photos = data.photos;
        if (data.hobbies) restoredData.hobbies = data.hobbies;
        if (data.distance_preference) restoredData.distance = data.distance_preference;
        if (data.goals) restoredData.goals = data.goals;
        if (data.gender) restoredData.gender = data.gender;
        if (data.location) restoredData.location = data.location;

        updateOnboardingData(restoredData);
      }

      setNextStep(currentStep);
    } catch (error) {
      console.error('Error checking onboarding progress:', error);
      // On error, start from the beginning
      setNextStep('age');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Preparing your profile...</Text>
        <Text style={styles.loadingSubtext}>This will only take a moment</Text>
      </View>
    );
  }

  return <Redirect href={`/onboarding/${nextStep}` as any} />;
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  loadingSubtext: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    marginTop: 8,
  },
  loadingText: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
});
