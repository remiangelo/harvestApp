import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

const GENDERS = [
  'Asexual', 'Bisexual', 'Gay', 'Intersex', 'Lesbian', 'Trans', 'Straight',
];

export default function OnboardingGender() {
  const [selected, setSelected] = useState<string | null>(null);
  const { currentUser } = useUserStore();

  // Pre-fill with demo data if available
  useEffect(() => {
    if (currentUser?.gender) {
      setSelected(currentUser.gender);
    }
  }, [currentUser]);

  const handleValidate = () => {
    if (selected) {
      return { gender: selected };
    }
    return null;
  };

  return (
    <OnboardingScreen
      progress={100}
      currentStep="gender"
      nextStep="location"
      onValidate={handleValidate}
      buttonDisabled={!selected}
    >
      <Text style={styles.title}>Be True to Yourself</Text>
      <Text style={styles.subtitle}>Choose the gender that best represents you. Authenticity is key to meaningful connections.</Text>
      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {GENDERS.map(gender => (
          <TouchableOpacity
            key={gender}
            style={[styles.option, selected === gender && styles.selectedOption]}
            onPress={() => setSelected(gender)}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, selected === gender && styles.selectedOptionText]}>{gender}</Text>
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
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'System',
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