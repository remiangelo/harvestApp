import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { router } from 'expo-router';
import { useOnboarding } from '../../hooks/useOnboarding';

const INTERESTED_IN_OPTIONS = ['Men', 'Women', 'Non-binary people', 'Everyone'];

export default function InterestedInScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const { onboardingData } = useOnboarding();

  // Smart defaults based on gender identity and sexual orientation
  useEffect(() => {
    const genderIdentity = (onboardingData as any)?.gender_identity;
    const sexualOrientation = (onboardingData as any)?.sexual_orientation;

    if (selected.length === 0 && genderIdentity && sexualOrientation) {
      let defaults: string[] = [];

      if (sexualOrientation === 'Straight') {
        if (genderIdentity === 'Man') {
          defaults = ['Women'];
        } else if (genderIdentity === 'Woman') {
          defaults = ['Men'];
        }
      } else if (sexualOrientation === 'Gay' && genderIdentity === 'Man') {
        defaults = ['Men'];
      } else if (sexualOrientation === 'Lesbian' && genderIdentity === 'Woman') {
        defaults = ['Women'];
      } else if (
        sexualOrientation === 'Bisexual' ||
        sexualOrientation === 'Pansexual' ||
        sexualOrientation === 'Queer'
      ) {
        defaults = ['Everyone'];
      }

      if (defaults.length > 0) {
        setSelected(defaults);
      }
    }
  }, [onboardingData, selected.length]);

  const toggleOption = (option: string) => {
    // If "Everyone" is selected, clear all others and select only "Everyone"
    if (option === 'Everyone') {
      setSelected(['Everyone']);
      return;
    }

    // If selecting a specific option, remove "Everyone" if present
    let newSelected = selected.filter((item) => item !== 'Everyone');

    if (newSelected.includes(option)) {
      newSelected = newSelected.filter((item) => item !== option);
    } else {
      newSelected = [...newSelected, option];
    }

    setSelected(newSelected);
  };

  const handleValidate = () => {
    if (selected.length > 0) {
      return { interested_in: selected };
    }
    return null;
  };

  const handleNext = () => {
    router.push('/onboarding/goals');
  };

  return (
    <OnboardingScreen
      progress={50}
      currentStep="interested-in"
      nextStep="goals"
      onValidate={handleValidate}
    >
      <Text style={styles.title}>Interested In</Text>
      <Text style={styles.subtitle}>Who would you like to see on Harvest?</Text>
      <View style={styles.optionsContainer}>
        <Text style={styles.hint}>Select all that apply. Smart defaults are applied.</Text>
        {INTERESTED_IN_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.option, selected.includes(option) && styles.optionSelected]}
            onPress={() => toggleOption(option)}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.optionText, selected.includes(option) && styles.optionTextSelected]}
            >
              {option}
            </Text>
            {selected.includes(option) && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  checkmark: {
    color: '#A0354E',
    fontSize: 24,
    fontWeight: 'bold',
  },
  hint: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  option: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
