import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useUserStore from '../../stores/useUserStore';

export default function OnboardingLocation() {
  const router = useRouter();
  const { currentUser, updateOnboardingData } = useUserStore();

  // Pre-fill with demo data if available
  useEffect(() => {
    if (currentUser?.location) {
      // Auto-complete location for demo users
      handleAllowLocation();
    }
  }, [currentUser]);

  const handleAllowLocation = () => {
    // Save location and mark onboarding as completed
    const location = currentUser?.location || 'San Francisco, CA';
    updateOnboardingData({ 
      location,
      onboardingCompleted: true 
    });
    
    // Redirect to main app
    router.replace('/_tabs');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '100%' }]} />
      </View>
      <View style={styles.iconContainer}>
        <Ionicons name="location" size={48} color="#8B1E2D" />
      </View>
      <Text style={styles.title}>Enable Location</Text>
      <Text style={styles.subtitle}>You need to enable location to be able to use Harvest</Text>
              <TouchableOpacity style={styles.button} onPress={handleAllowLocation}>
          <Text style={styles.buttonText}>Allow Location</Text>
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
  iconContainer: {
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'System',
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
    fontFamily: 'System',
  },
}); 