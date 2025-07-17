import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

const GOALS = ['Dating', 'Relationship', 'Marriage'];

export default function OnboardingGoals() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    // TODO: Save selected goal to global state or backend
    router.push('/onboarding/gender');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '100%' }]} />
      </View>
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
              <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={!selected}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#8B1E2D',
    borderRadius: 4,
  },
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
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#8B1E2D',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    opacity: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
}); 