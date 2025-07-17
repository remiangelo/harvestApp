import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function OnboardingBio() {
  const [bio, setBio] = useState('');
  const router = useRouter();

  const handleContinue = () => {
    // TODO: Save bio to global state or backend
    router.push('/onboarding/nickname');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '60%' }]} />
      </View>
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
              <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={!bio}>
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
    fontFamily: 'System', // Replace with Figma font if available
  },
}); 