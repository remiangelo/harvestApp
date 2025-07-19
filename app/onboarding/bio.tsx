import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

export default function OnboardingBio() {
  const [bio, setBio] = useState('');
  const { currentUser } = useUserStore();

  // Pre-fill with demo data if available
  useEffect(() => {
    if (currentUser?.bio) {
      setBio(currentUser.bio);
    }
  }, [currentUser]);

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
      <Text style={styles.subtitle}>Add a bio to your profile so people get to know you before swiping!</Text>
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
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    marginBottom: 32,
    backgroundColor: '#fafafa',
    textAlign: 'left',
    fontFamily: 'System', // Replace with Figma font if available
  },
}); 