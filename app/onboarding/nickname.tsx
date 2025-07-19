import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import useUserStore from '../../stores/useUserStore';

export default function OnboardingNickname() {
  const [nickname, setNickname] = useState('');
  const router = useRouter();
  const { currentUser, updateOnboardingData } = useUserStore();

  // Pre-fill with demo data if available
  useEffect(() => {
    if (currentUser?.nickname) {
      setNickname(currentUser.nickname);
    }
  }, [currentUser]);

  const handleContinue = () => {
    // Save nickname to user context
    updateOnboardingData({ nickname });
    router.push('/onboarding/photos');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '70%' }]} />
      </View>
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
              <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={!nickname}>
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