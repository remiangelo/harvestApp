import React, { ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { useOnboarding } from '../hooks/useOnboarding';

interface OnboardingScreenProps {
  children: ReactNode;
  progress: number;
  currentStep: string;
  nextStep: string;
  onValidate: () => Record<string, any> | null;
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
  const { goToNextStep, isSaving } = useOnboarding();

  const handleContinue = async () => {
    const data = onValidate();
    if (data) {
      await goToNextStep(currentStep, nextStep, data);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#8B1E2D',
    borderRadius: 4,
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#8B1E2D',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});