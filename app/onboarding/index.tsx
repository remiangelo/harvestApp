import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../stores/useAuthStore';
import { getOnboardingProgress } from '../../lib/onboarding';
import useUserStore from '../../stores/useUserStore';
import { theme } from '../../constants/theme';

const FEATURES_SEEN_KEY = 'harvest_features_seen';

export default function OnboardingIndex() {
  const [loading, setLoading] = useState(true);
  const [nextStep, setNextStep] = useState<string>('features');
  const { user, isTestMode } = useAuthStore();
  const { updateOnboardingData, currentUser } = useUserStore();

  useEffect(() => {
    checkProgress();
  }, [user, isTestMode, currentUser]);

  const checkProgress = async () => {
    console.log('[OnboardingIndex] Checking progress - isTestMode:', isTestMode);
    console.log('[OnboardingIndex] User:', user ? 'exists' : 'null');
    console.log('[OnboardingIndex] CurrentUser:', currentUser ? 'exists' : 'null');

    // Check if user has seen features intro
    const featuresSeen = await AsyncStorage.getItem(FEATURES_SEEN_KEY);
    const hasSeenFeatures = featuresSeen === 'true';

    // In test mode, skip database check and start from features (if not seen) or age
    if (isTestMode) {
      console.log('[OnboardingIndex] Test mode detected');
      if (!hasSeenFeatures) {
        console.log('[OnboardingIndex] Showing features intro');
        setNextStep('features');
        await AsyncStorage.setItem(FEATURES_SEEN_KEY, 'true');
      } else {
        console.log('[OnboardingIndex] Features already seen, starting from age');
        setNextStep('age');
      }
      setLoading(false);
      return;
    }

    if (!user) {
      console.log('[OnboardingIndex] No user found');
      if (!hasSeenFeatures) {
        console.log('[OnboardingIndex] Showing features intro');
        setNextStep('features');
        await AsyncStorage.setItem(FEATURES_SEEN_KEY, 'true');
      } else {
        console.log('[OnboardingIndex] Features already seen, starting from age');
        setNextStep('age');
      }
      setLoading(false);
      return;
    }

    try {
      const { currentStep, data } = await getOnboardingProgress(user.id);

      // Restore saved onboarding data
      if (data) {
        const restoredData: any = {};

        // Map database fields to local state (streamlined onboarding flow)
        if (data.age) restoredData.age = data.age;
        if (data.nickname) restoredData.nickname = data.nickname;
        if (data.photos) restoredData.photos = data.photos;
        if (data.goals) restoredData.goals = data.goals;
        if (data.gender) restoredData.gender = data.gender;
        if ((data as any).interested_in) restoredData.interested_in = (data as any).interested_in;
        if (data.location) restoredData.location = data.location;

        updateOnboardingData(restoredData);
      }

      // If user has progress, skip features intro
      if (currentStep !== 'age' || hasSeenFeatures) {
        setNextStep(currentStep);
      } else {
        // New user, show features first
        setNextStep('features');
        await AsyncStorage.setItem(FEATURES_SEEN_KEY, 'true');
      }
    } catch (error) {
      console.error('Error checking onboarding progress:', error);
      // On error, check if features seen
      if (!hasSeenFeatures) {
        setNextStep('features');
        await AsyncStorage.setItem(FEATURES_SEEN_KEY, 'true');
      } else {
        setNextStep('age');
      }
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
