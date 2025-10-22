import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import useUserStore from '../../stores/useUserStore';

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
  const { onboardingData } = useUserStore();

  // Restore progress if user returns to this screen
  useEffect(() => {
    if (onboardingData?.preferences) {
      setSelected(onboardingData.preferences);
    }
  }, [onboardingData]);

  const handleValidate = () => {
    if (selected) {
      return { preferences: selected }; // Fixed: Database column is 'preferences' not 'sexual_orientation'
    }
    return null;
  };

  return (
    <OnboardingScreen
      progress={40}
      currentStep="sexual-orientation"
      nextStep="interested-in"
      onValidate={handleValidate}
      buttonDisabled={!selected}
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
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#8B1E2D',
    borderRadius: 28,
    borderWidth: 2,
    elevation: 3,
    height: 56,
    justifyContent: 'center',
    marginBottom: 16,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  optionSelected: {
    backgroundColor: '#8B1E2D',
    borderColor: '#8B1E2D',
    borderWidth: 2,
    elevation: 6,
    shadowColor: '#8B1E2D',
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  optionText: {
    color: '#8B1E2D',
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  optionsContainer: {
    alignItems: 'center',
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
