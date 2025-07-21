import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '../hooks/useOnboarding';

interface OnboardingStepData {
  age?: Date;
  preferences?: string;
  bio?: string;
  nickname?: string;
  photos?: string[];
  hobbies?: string[];
  distance?: number;
  goals?: string;
  gender?: string;
  location?: string;
}

interface OnboardingScreenProps {
  children: ReactNode;
  progress: number;
  currentStep: string;
  nextStep: string;
  onValidate: () => Partial<OnboardingStepData> | null;
  buttonText?: string;
  buttonDisabled?: boolean;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  children,
  progress,
  currentStep,
  nextStep,
  onValidate,
  buttonText = 'Continue',
  buttonDisabled = false,
}) => {
  const insets = useSafeAreaInsets();
  const { goToNextStep, isSaving } = useOnboarding();

  const handleContinue = async () => {
    const data = onValidate();
    if (data) {
      await goToNextStep(currentStep, nextStep, data);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        {children}

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
});
