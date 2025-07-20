import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

export default function OnboardingNickname() {
  const [nickname, setNickname] = useState('');
  const { onboardingData } = useUserStore();

  // Pre-fill with restored data if available
  useEffect(() => {
    if (onboardingData?.nickname) {
      setNickname(onboardingData.nickname);
    }
  }, [onboardingData]);

  const handleValidate = () => {
    if (nickname.trim()) {
      return { nickname: nickname.trim() };
    }
    return null;
  };

  return (
    <OnboardingScreen
      progress={70}
      currentStep="nickname"
      nextStep="photos"
      onValidate={handleValidate}
      buttonDisabled={!nickname.trim()}
    >
      <Text style={styles.title}>Your Harvest Name</Text>
      <Text style={styles.subtitle}>Create a unique nickname that represents you. It’s how others will know and remember you.</Text>
      <TextInput
        style={styles.input}
        placeholder="Nickname"
        placeholderTextColor="#888"
        value={nickname}
        onChangeText={setNickname}
        maxLength={32}
      />
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
    fontFamily: 'System', // Replace with Figma font if available
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'System', // Replace with Figma font if available
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
    textAlign: 'center',
    fontFamily: 'System', // Replace with Figma font if available
  },
}); 