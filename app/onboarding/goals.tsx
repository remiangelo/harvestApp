import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

const GOALS = ['Dating', 'Relationship', 'Marriage'];

export default function OnboardingGoals() {
  const [selected, setSelected] = useState<string[]>([]);
  const { onboardingData } = useUserStore();

  // Pre-fill with restored data if available
  useEffect(() => {
    if (onboardingData?.goals) {
      // Handle both array and string formats for backward compatibility
      if (Array.isArray(onboardingData.goals)) {
        setSelected(onboardingData.goals);
      } else if (typeof onboardingData.goals === 'string') {
        setSelected([onboardingData.goals]);
      }
    }
  }, [onboardingData]);

  const toggleGoal = (goal: string) => {
    if (selected.includes(goal)) {
      setSelected(selected.filter((item) => item !== goal));
    } else {
      setSelected([...selected, goal]);
    }
  };

  const handleValidate = () => {
    if (selected.length > 0) {
      return { goals: selected };
    }
    return null;
  };

  return (
    <OnboardingScreen
      progress={100}
      currentStep="goals"
      nextStep="gender-identity"
      onValidate={handleValidate}
      buttonDisabled={selected.length === 0}
    >
      <Text style={styles.title}>Relationship Goals</Text>
      <Text style={styles.subtitle}>
        Choose all that interest you. You can select multiple options.
      </Text>
      <View style={styles.optionsContainer}>
        {GOALS.map((goal) => (
          <TouchableOpacity
            key={goal}
            style={[styles.option, selected.includes(goal) && styles.selectedOption]}
            onPress={() => toggleGoal(goal)}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, selected.includes(goal) && styles.selectedOptionText]}>
              {goal}
            </Text>
            {selected.includes(goal) && <Text style={styles.checkmark}>✓</Text>}
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
