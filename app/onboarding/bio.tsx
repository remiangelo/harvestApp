import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

export default function OnboardingBio() {
  const [bio, setBio] = useState('');
  const { onboardingData } = useUserStore();

  // Pre-fill with restored data if available
  useEffect(() => {
    if (onboardingData?.bio) {
      setBio(onboardingData.bio);
    }
  }, [onboardingData]);

  const handleValidate = () => {
    if (bio.trim()) {
      return { bio: bio.trim() };
    }
    return null;
  };

  return (
    <OnboardingScreen
      progress={60}
      currentStep="bio"
      nextStep="nickname"
      onValidate={handleValidate}
      buttonDisabled={!bio.trim()}
    >
      <Text style={styles.title}>Describe Your True Self!</Text>
      <Text style={styles.subtitle}>
        Add a bio to your profile so people get to know you before swiping!
      </Text>
      <TextInput
        style={styles.input}
        placeholder="I'm a person that loves...."
        placeholderTextColor="#888"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
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
    marginBottom: 32,
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 16,
    textAlign: 'left',
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
