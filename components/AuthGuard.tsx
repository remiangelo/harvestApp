import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../stores/useAuthStore';
import useUserStore from '../stores/useUserStore';
import { getOnboardingProgress } from '../lib/onboarding';
import { theme } from '../constants/theme';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, profile, initialize, user, isTestMode } = useAuthStore();
  const { currentUser } = useUserStore();
  const [checkingProgress, setCheckingProgress] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '_tabs';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to auth if not authenticated
      router.replace('/auth');
    } else if (isAuthenticated) {
      // Check if onboarding is complete
      const isOnboardingComplete = isTestMode
        ? currentUser?.onboardingCompleted
        : profile?.onboarding_completed;

      if (inAuthGroup) {
        // Authenticated user on login page
        if (isOnboardingComplete) {
          router.replace('/_tabs');
        } else {
          router.replace('/onboarding');
        }
      } else if (inTabs && !isOnboardingComplete) {
        // User trying to access main app without completing onboarding
        router.replace('/onboarding');
      } else if (!inOnboarding && !inTabs && !isOnboardingComplete) {
        // User not in onboarding or tabs and hasn't completed onboarding
        router.replace('/onboarding');
      }
    }
  }, [isAuthenticated, isLoading, profile, segments, isTestMode, currentUser]);

  const checkOnboardingProgress = async () => {
    if (checkingProgress) return;

    // In test mode, always go to the start of onboarding
    if (isTestMode) {
      setTimeout(() => router.replace('/onboarding'), 0);
      return;
    }

    if (!user) return;

    setCheckingProgress(true);
    try {
      const { currentStep, data } = await getOnboardingProgress(user.id);

      // Update local store with saved data
      if (data) {
        const onboardingData: any = {};

        // Map database fields to local state fields
        if (data.age) onboardingData.age = data.age;
        if (data.preferences) onboardingData.preferences = data.preferences;
        if (data.bio) onboardingData.bio = data.bio;
        if (data.nickname) onboardingData.nickname = data.nickname;
        if (data.photos) onboardingData.photos = data.photos;
        if (data.hobbies) onboardingData.hobbies = data.hobbies;
        if (data.distance_preference) onboardingData.distance = data.distance_preference;
        if (data.goals) onboardingData.goals = data.goals;
        if (data.gender) onboardingData.gender = data.gender;
        if (data.location) onboardingData.location = data.location;

        // Update the onboarding data in store
        useUserStore.getState().updateOnboardingData(onboardingData);
      }

      // Navigate to the appropriate step
      setTimeout(() => {
        if (currentStep === 'complete') {
          router.replace('/onboarding/complete' as any);
        } else {
          router.replace(`/onboarding/${currentStep}` as any);
        }
      }, 0);
    } catch (error) {
      console.error('Error checking onboarding progress:', error);
      // Fallback to start of onboarding
      setTimeout(() => router.replace('/onboarding'), 0);
    } finally {
      setCheckingProgress(false);
    }
  };

  if (isLoading || checkingProgress) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: 'center',
  },
});
