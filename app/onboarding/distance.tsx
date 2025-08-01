import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

export default function OnboardingDistance() {
  const [distance, setDistance] = useState(4);
  const { onboardingData } = useUserStore();

  // Pre-fill with restored data if available
  useEffect(() => {
    if (onboardingData?.distance) {
      setDistance(onboardingData.distance);
    }
  }, [onboardingData]);

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
      <Text style={styles.subtitle}>
        Select your preferred distance range to discover matches conveniently. We’ll help you find
        love close by.
      </Text>
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
  slider: {
    height: 40,
    marginBottom: 32,
    width: '100%',
  },
  sliderLabel: {
    color: '#222',
    fontFamily: 'System',
    fontSize: 16,
  },
  sliderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    width: '100%',
  },
  sliderValue: {
    color: '#8B1E2D',
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#555',
    fontFamily: 'System',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  title: {
    color: '#222',
    fontFamily: 'System',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});
