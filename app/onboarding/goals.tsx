import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

const GOALS = ['Dating', 'Relationship', 'Marriage'];

export default function OnboardingGoals() {
  const [selected, setSelected] = useState<string | null>(null);
  const { currentUser } = useUserStore();

  // Pre-fill with demo data if available
  useEffect(() => {
    if (currentUser?.goals) {
      setSelected(currentUser.goals);
    }
  }, [currentUser]);

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
      <Text style={styles.subtitle}>Choose the type of relationship you’re seeking on Harvest!</Text>
      <View style={styles.optionsContainer}>
        {GOALS.map(goal => (
          <TouchableOpacity
            key={goal}
            style={[styles.option, selected === goal && styles.selectedOption]}
            onPress={() => setSelected(goal)}
            activeOpacity={0.8}
          >
            <Text style={[styles.optionText, selected === goal && styles.selectedOptionText]}>{goal}</Text>
          </TouchableOpacity>
        ))}
      </View>
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