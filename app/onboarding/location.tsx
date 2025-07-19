import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

export default function OnboardingLocation() {
  const { currentUser } = useUserStore();

  // Pre-fill with demo data if available
  useEffect(() => {
    // Demo users already have location data
    // No auto-navigation needed with new flow
  }, [currentUser]);

  const handleValidate = () => {
    const location = currentUser?.location || 'San Francisco, CA';
    return { location };
  };

  return (
    <OnboardingScreen
      progress={100}
      currentStep="location"
      nextStep="complete"
      onValidate={handleValidate}
      buttonText="Allow Location"
    >
      <View style={styles.iconContainer}>
        <Ionicons name="location" size={48} color="#8B1E2D" />
      </View>
      <Text style={styles.title}>Enable Location</Text>
      <Text style={styles.subtitle}>You need to enable location to be able to use Harvest</Text>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
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
}); 