import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import useUserStore from '../../stores/useUserStore';

export default function OnboardingDistance() {
  const [distance, setDistance] = useState(4);
  const router = useRouter();
  const { currentUser, updateOnboardingData } = useUserStore();

  // Pre-fill with demo data if available
  useEffect(() => {
    if (currentUser?.distance) {
      setDistance(currentUser.distance);
    }
  }, [currentUser]);

  const handleContinue = () => {
    // Save distance to user context
    updateOnboardingData({ distance });
    router.push('/onboarding/goals');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '100%' }]} />
      </View>
      <Text style={styles.title}>Find Match Nearby</Text>
      <Text style={styles.subtitle}>Select your preferred distance range to discover matches conveniently. We’ll help you find love close by.</Text>
      <View style={styles.sliderRow}>
        <Text style={styles.sliderLabel}>Distance Preference</Text>
        <Text style={styles.sliderValue}>{distance} km</Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={100}
        step={1}
        value={distance}
        onValueChange={setDistance}
        minimumTrackTintColor="#8B1E2D"
        maximumTrackTintColor="#eee"
        thumbTintColor="#8B1E2D"
      />
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
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'System',
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 16,
    color: '#222',
    fontFamily: 'System',
  },
  sliderValue: {
    fontSize: 16,
    color: '#8B1E2D',
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 32,
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