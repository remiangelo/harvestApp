import { theme } from '../../constants/theme';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/OnboardingScreen';

const GENDER_IDENTITIES = ['Man', 'Woman', 'Non-binary', 'Prefer not to say', 'Other'];

export default function GenderIdentityScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  const handleValidate = () => {
    if (selected) {
      return { gender: selected }; // Fixed: Database column is 'gender' not 'gender_identity'
    }
    return null;
  };

  return (
    <OnboardingScreen
      progress={62.5}
      currentStep="gender-identity"
      nextStep="interested-in"
      onValidate={handleValidate}
      buttonDisabled={!selected}
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
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: theme.colors.primary,
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
    textAlign: 'center',
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
