import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

const GOALS = ['Dating', 'Relationship', 'Marriage'];

export default function OnboardingGoals() {
  const [selected, setSelected] = useState<string | null>(null);
  const { onboardingData } = useUserStore();

  // Pre-fill with restored data if available
  useEffect(() => {
    if (onboardingData?.goals) {
      setSelected(onboardingData.goals);
    }
  }, [onboardingData]);

  const handleValidate = () => {
    if (selected) {
      return { goals: selected };
    }
    return null;
  };

  return (
    <OnboardingScreen
      progress={100}
      currentStep="goals"
      nextStep="gender"
      onValidate={handleValidate}
      buttonDisabled={!selected}
    >
      <Text style={styles.title}>Relationship Goals</Text>
      <Text style={styles.subtitle}>
        Choose the type of relationship you’re seeking on Harvest!
      </Text>
      <View style={styles.optionsContainer}>
        {GOALS.map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[styles.option, selected === goal && styles.selectedOption]}
            onPress={() => setSelected(goal)}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, selected === goal && styles.selectedOptionText]}>
              {goal}
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
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  optionText: {
    color: '#8B1E2D',
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  optionsContainer: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  selectedOption: {
    backgroundColor: '#8B1E2D',
    borderColor: '#8B1E2D',
    borderWidth: 2,
    elevation: 6,
    shadowColor: '#8B1E2D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 0.5,
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
