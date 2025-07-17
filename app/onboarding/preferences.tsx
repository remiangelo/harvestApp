import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

const options = [
  'Asexual',
  'Bisexual',
  'Gay',
  'Intersex',
  'Lesbian',
  'Trans',
];

export default function OnboardingPreferences() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    // TODO: Save selected preference to global state or backend
    router.push('/onboarding/bio');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '50%' }]} />
      </View>
      <Text style={styles.title}>What is your preference?</Text>
      <Text style={styles.subtitle}>Choose the genders that you wish to meet on Harvest!</Text>
      <ScrollView contentContainerStyle={styles.optionsContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.option, selected === option && styles.selectedOption]}
            onPress={() => setSelected(option)}
          >
            <Text style={[styles.optionText, selected === option && styles.selectedOptionText]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    width: '90%',
    alignSelf: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#8B1E2D',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    marginHorizontal: 0,
  },
  selectedOption: {
    backgroundColor: '#8B1E2D',
    borderWidth: 2,
    borderColor: '#8B1E2D',
  },
  optionText: {
    color: '#8B1E2D',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  selectedOptionText: {
    fontWeight: 'bold',
    color: '#fff',
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
  },
}); 