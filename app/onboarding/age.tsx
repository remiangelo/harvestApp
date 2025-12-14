import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

export default function OnboardingAge() {
  const [date, setDate] = useState(new Date(2000, 0, 1));
  const [show, setShow] = useState(false);
  const { onboardingData } = useUserStore();

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

  const handleValidate = () => {
    return { age: date };
  };

  const onChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  return (
    <OnboardingScreen
      progress={12.5}
      currentStep="age"
      nextStep="nickname"
      onValidate={handleValidate}
    >
      <Text style={styles.title}>Let&apos;s Start with Your Age</Text>
      <Text style={styles.subtitle}>Input your birth date so people know how old you are</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShow(true)}
        accessibilityRole="button"
        accessibilityLabel="Select your birth date"
        accessibilityHint="Tap to open date picker"
      >
        <Text style={styles.inputText}>{date ? date.toLocaleDateString() : 'MM/DD/YYYY'}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display="spinner"
          onChange={onChange}
          maximumDate={new Date()}
          accessibilityLabel="Date picker for selecting birth date"
        />
      )}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  input: {
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderColor: '#ccc',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    width: '100%',
  },
  inputText: {
    color: '#222',
    fontSize: 18,
    textAlign: 'center',
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
