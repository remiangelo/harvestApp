import { theme } from '../../constants/theme';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { useOnboarding } from '../../hooks/useOnboarding';

const INTERESTED_IN_OPTIONS = ['Men', 'Women', 'Non-binary', 'Everyone'];

export default function InterestedInScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const { onboardingData } = useOnboarding();

  // Smart defaults based on gender and preferences (fixed column names)
  useEffect(() => {
    const gender = onboardingData?.gender;
    const preferences = onboardingData?.preferences;

    if (selected.length === 0 && gender && preferences) {
      let defaults: string[] = [];

      if (preferences === 'Straight') {
        if (gender === 'Man') {
          defaults = ['Women'];
        } else if (gender === 'Woman') {
          defaults = ['Men'];
        }
      } else if (preferences === 'Gay' && gender === 'Man') {
        defaults = ['Men'];
      } else if (preferences === 'Lesbian' && gender === 'Woman') {
        defaults = ['Women'];
      } else if (
        preferences === 'Bisexual' ||
        preferences === 'Pansexual' ||
        preferences === 'Queer'
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
      console.log('[InterestedIn] User selected:', selected);
      // Note: interested_in doesn't have a database column
      // This data is used for matching logic but not persisted
      // The matching is done via preferences/sexual_orientation fields
      // Return empty object to skip database save and just navigate
      // The preferences field was already saved in the sexual-orientation step
      return {};
    }
    return null;
  };
  return (
    <OnboardingScreen
      progress={50}
      currentStep="interested-in"
      nextStep="location"
      onValidate={handleValidate}
      buttonDisabled={selected.length === 0}
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
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  hint: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  option: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: theme.colors.primary,
    borderRadius: 28,
    borderWidth: 2,
    elevation: 3,
    flexDirection: 'row',
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
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    borderWidth: 2,
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      height: 4,
      width: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  optionText: {
    color: theme.colors.primary,
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
    fontFamily: 'System',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  title: {
    color: '#222',
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});
