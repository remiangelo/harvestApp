import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../../stores/useAuthStore';
import { getOnboardingProgress } from '../../lib/onboarding';
import useUserStore from '../../stores/useUserStore';
import { theme } from '../../constants/theme';

export default function OnboardingIndex() {
  const [loading, setLoading] = useState(true);
  const [nextStep, setNextStep] = useState<string>('age');
  const { user } = useAuthStore();
  const { updateOnboardingData } = useUserStore();

  useEffect(() => {
    checkProgress();
  }, [user]);

  const checkProgress = async () => {
    if (!user) {
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
});
