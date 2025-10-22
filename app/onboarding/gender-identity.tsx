import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { router } from 'expo-router';

const GENDER_IDENTITIES = ['Man', 'Woman', 'Non-binary', 'Prefer not to say', 'Other'];

export default function GenderIdentityScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleValidate = () => {
    if (selected) {
      return { gender: selected }; // Fixed: Database column is 'gender' not 'gender_identity'
    }
    return null;
  };

  const handleNext = () => {
    router.push('/onboarding/sexual-orientation' as any);
  };

  return (
    <OnboardingScreen
      progress={30}
      currentStep="gender-identity"
      nextStep="sexual-orientation"
      onValidate={handleValidate}
    >
      <Text style={styles.title}>Gender Identity</Text>
      <Text style={styles.subtitle}>How do you identify?</Text>
      <View style={styles.optionsContainer}>
        {GENDER_IDENTITIES.map((identity) => (
          <TouchableOpacity
            key={identity}
            style={[styles.option, selected === identity && styles.optionSelected]}
            onPress={() => setSelected(identity)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, selected === identity && styles.optionTextSelected]}>
              {identity}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  optionSelected: {
    backgroundColor: 'rgba(160, 53, 78, 0.2)',
    borderColor: '#A0354E',
    borderWidth: 2,
  },
  optionText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#A0354E',
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  subtitle: {
    color: '#555',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  title: {
    color: '#222',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});
