import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import useUserStore from '../../stores/useUserStore';
import { useOnboarding } from '../../hooks/useOnboarding';

export default function OnboardingAge() {
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [show, setShow] = useState(false);
  const router = useRouter();
  const { onboardingData } = useUserStore();
  const { goToNextStep, isSaving } = useOnboarding();

  // Pre-fill with restored or demo data
  useEffect(() => {
    if (onboardingData?.age) {
      if (typeof onboardingData.age === 'number') {
        // Convert age number back to Date
        const birthYear = new Date().getFullYear() - onboardingData.age;
        setDate(new Date(birthYear, 0, 1));
      } else if (onboardingData.age instanceof Date) {
        setDate(onboardingData.age);
      }
    }
  }, [onboardingData]);

  const handleContinue = async () => {
    // Save birthDate and navigate to next step
    await goToNextStep('age', 'preferences', { age: date });
  };

  const onChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar} />
        </View>
        <Text style={styles.title}>Let's Start with Your Age</Text>
        <Text style={styles.subtitle}>Input your birth date so people know how old you are</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShow(true)}>
          <Text style={{ color: date ? '#222' : '#888', fontSize: 18, textAlign: 'center' }}>
            {date ? date.toLocaleDateString() : 'MM/DD/YYYY'}
          </Text>
        </TouchableOpacity>
        {show && (
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={onChange}
            maximumDate={new Date()}
          />
        )}
        <TouchableOpacity
          style={[styles.button, isSaving && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#8B1E2D',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'flex-start',
    paddingBottom: 32,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  input: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderColor: '#ccc',
    borderRadius: 24,
    borderWidth: 1,
    fontSize: 18,
    height: 48,
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    width: '100%',
  },
  progressBar: {
    backgroundColor: '#8B1E2D',
    borderRadius: 4,
    height: 8,
    width: '33%',
  },
  progressBarContainer: {
    backgroundColor: '#eee',
    borderRadius: 4,
    height: 8,
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
