import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

const options = [
  'Asexual',
  'Bisexual',
  'Gay',
  'Intersex',
  'Lesbian',
  'Trans',
  'Straight',
];

export default function OnboardingPreferences() {
  const [selected, setSelected] = useState<string | null>(null);
  const { currentUser } = useUserStore();

  // Pre-fill with demo data if available
  useEffect(() => {
    if (currentUser?.preferences) {
      setSelected(currentUser.preferences);
    }
  }, [currentUser]);

  const handleValidate = () => {
    if (selected) {
      return { preferences: selected };
    }
    return null;
  };

  return (
    <OnboardingScreen
      progress={50}
      currentStep="preferences"
      nextStep="bio"
      onValidate={handleValidate}
      buttonDisabled={!selected}
    >
      <Text style={styles.title}>What is your preference?</Text>
      <Text style={styles.subtitle}>Choose the genders that you wish to meet on Harvest!</Text>
      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.option, selected === option && styles.selectedOption]}
            onPress={() => setSelected(option)}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, selected === option && styles.selectedOptionText]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  option: {
    width: '100%',
    minWidth: 280,
    height: 56,
    borderWidth: 2,
    borderColor: '#8B1E2D',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedOption: {
    backgroundColor: '#8B1E2D',
    borderWidth: 2,
    borderColor: '#8B1E2D',
    shadowColor: '#8B1E2D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  optionText: {
    color: '#8B1E2D',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
    letterSpacing: 0.5,
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
}); 