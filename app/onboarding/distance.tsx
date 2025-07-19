import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

export default function OnboardingDistance() {
  const [distance, setDistance] = useState(4);
  const { currentUser } = useUserStore();

  // Pre-fill with demo data if available
  useEffect(() => {
    if (currentUser?.distance) {
      setDistance(currentUser.distance);
    }
  }, [currentUser]);

  const handleValidate = () => {
    return { distance };
  };

  return (
    <OnboardingScreen
      progress={100}
      currentStep="distance"
      nextStep="goals"
      onValidate={handleValidate}
    >
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
}); 