import React, { useState, useEffect } from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

export default function OnboardingNickname() {
  const [firstName, setFirstName] = useState('');
  const { onboardingData } = useUserStore();

  // Pre-fill with restored data if available
  useEffect(() => {
    const storedNickname = (onboardingData as any)?.nickname;
    if (storedNickname) {
      setFirstName(storedNickname);
    }
  }, [onboardingData]);

  const handleValidate = () => {
    const trimmedName = firstName.trim();
    if (trimmedName && trimmedName.length >= 2) {
      return { nickname: trimmedName };
    }
    return null;
  };

  return (
    <OnboardingScreen
      progress={70}
      currentStep="nickname"
      nextStep="photos"
      onValidate={handleValidate}
      buttonDisabled={!firstName.trim() || firstName.trim().length < 2}
    >
      <Text style={styles.title}>What&apos;s your name?</Text>
      <Text style={styles.subtitle}>
        Let us know your first name. This is how others will see you on Harvest.
      </Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#888"
        value={firstName}
        onChangeText={setFirstName}
        maxLength={32}
        autoCapitalize="words"
      />
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fafafa',
    borderColor: '#ccc',
    borderRadius: 24,
    borderWidth: 1,
    fontFamily: 'System',
    fontSize: 18,
    height: 48,
    marginBottom: 32,
    paddingHorizontal: 16,
    textAlign: 'center',
    width: '100%', // Replace with Figma font if available
  },
  subtitle: {
    color: '#555',
    fontFamily: 'System',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center', // Replace with Figma font if available
  },
  title: {
    color: '#222',
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center', // Replace with Figma font if available
  },
});
