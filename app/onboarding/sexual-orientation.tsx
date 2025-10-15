import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { router } from 'expo-router';

const SEXUAL_ORIENTATIONS = [
  'Straight',
  'Gay',
  'Lesbian',
  'Bisexual',
  'Pansexual',
  'Asexual',
  'Queer',
  'Questioning',
];

export default function SexualOrientationScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleValidate = () => {
    if (selected) {
      return { sexual_orientation: selected };
    }
    return null;
  };

  const handleNext = () => {
    router.push('/onboarding/interested-in' as any);
  };

  return (
    <OnboardingScreen
      progress={40}
      currentStep="sexual-orientation"
      nextStep="interested-in"
      onValidate={handleValidate}
    >
      <Text style={styles.title}>Sexual Orientation</Text>
      <Text style={styles.subtitle}>Who are you attracted to?</Text>
      <View style={styles.optionsContainer}>
        {SEXUAL_ORIENTATIONS.map((orientation) => (
          <TouchableOpacity
            key={orientation}
            style={[styles.option, selected === orientation && styles.optionSelected]}
            onPress={() => setSelected(orientation)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.optionText, selected === orientation && styles.optionTextSelected]}
            >
              {orientation}
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
