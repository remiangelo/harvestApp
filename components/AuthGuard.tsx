import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../stores/useAuthStore';
import { getOnboardingProgress } from '../lib/onboarding';
import { theme } from '../constants/theme';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, profile, initialize, user } = useAuthStore();
  const [checkingProgress, setCheckingProgress] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect authenticated users away from auth screens
      if (profile?.onboarding_completed) {
        router.replace('/_tabs');
      } else {
        // Check onboarding progress and redirect to appropriate step
        checkOnboardingProgress();
      }
    } else if (isAuthenticated && !profile?.onboarding_completed && !inOnboarding) {
      // Redirect to onboarding if not completed
      checkOnboardingProgress();
    }
  }, [isAuthenticated, isLoading, profile, segments]);

  const checkOnboardingProgress = async () => {
    if (!user || checkingProgress) return;
    
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
        const userStore = require('../stores/useUserStore').default;
        userStore.getState().updateOnboardingData(onboardingData);
      }
      
      // Navigate to the appropriate step
      if (currentStep === 'complete') {
        router.replace('/onboarding/complete' as any);
      } else {
        router.replace(`/onboarding/${currentStep}` as any);
      }
    } catch (error) {
      console.error('Error checking onboarding progress:', error);
      // Fallback to start of onboarding
      router.replace('/onboarding');
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});