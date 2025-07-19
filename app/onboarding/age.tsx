import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import useUserStore from '../../stores/useUserStore';

export default function OnboardingAge() {
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [show, setShow] = useState(false);
  const router = useRouter();
  const { currentUser, updateOnboardingData } = useUserStore();

  // Pre-fill with demo data if available
  useEffect(() => {
    if (currentUser?.age && typeof currentUser.age === 'number') {
      // Convert age to Date if it's not already
      const birthYear = new Date().getFullYear() - currentUser.age;
      setDate(new Date(birthYear, 0, 1));
    }
  }, [currentUser]);

  const handleContinue = () => {
    // Save birthDate to user context
    updateOnboardingData({ age: date });
    // Navigate to preferences
    router.push('/onboarding/preferences');
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
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
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
    width: '33%',
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
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 18,
    marginBottom: 32,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#8B1E2D',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 