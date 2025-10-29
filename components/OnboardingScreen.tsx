import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '../hooks/useOnboarding';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface OnboardingStepData {
  age?: Date;
  preferences?: string;
  bio?: string;
  nickname?: string;
  first_name?: string;
  photos?: string[];
  hobbies?: string[];
  distance?: number;
  goals?: string | string[];
  gender?: string;
  gender_identity?: string;
  sexual_orientation?: string;
  interested_in?: string[];
  location?: string;
  terms_accepted?: boolean;
  age_confirmed?: boolean;
}

interface OnboardingScreenProps {
  children: ReactNode;
  progress: number;
  currentStep: string;
  nextStep: string;
  onValidate: () => Partial<OnboardingStepData> | Promise<Partial<OnboardingStepData>> | null;
  buttonText?: string;
  buttonDisabled?: boolean;
  showBackButton?: boolean;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  children,
  progress,
  currentStep,
  nextStep,
  onValidate,
  buttonText = 'Continue',
  buttonDisabled = false,
  showBackButton = true,
}) => {
  const insets = useSafeAreaInsets();
  const { goToNextStep, isSaving } = useOnboarding();

  const handleContinue = async () => {
    const data = await Promise.resolve(onValidate());
    if (data) {
      await goToNextStep(currentStep, nextStep, data);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
        {showBackButton && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#8B1E2D" />
          </TouchableOpacity>
        )}

        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>

        <TouchableOpacity
          style={[styles.button, (buttonDisabled || isSaving) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={buttonDisabled || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{buttonText}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    left: 24,
    padding: 8,
    position: 'absolute',
    top: 12,
    zIndex: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#8B1E2D',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'flex-start',
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  progressBar: {
    backgroundColor: '#8B1E2D',
    borderRadius: 4,
    height: 8,
  },
  progressBarContainer: {
    backgroundColor: '#eee',
    borderRadius: 4,
    height: 8,
    marginBottom: 32,
    width: '100%',
  },
  safeArea: {
    backgroundColor: '#fff',
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 24,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
});
