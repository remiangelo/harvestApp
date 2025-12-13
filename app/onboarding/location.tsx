import { theme } from '../../constants/theme';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

export default function OnboardingLocation() {
  const { onboardingData } = useUserStore();
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkLocationPermission = async () => {
    try {
      console.log('[OnboardingLocation] Checking location permission');
      console.log('[OnboardingLocation] Platform:', Platform.OS);

      // Add a small delay to ensure Location module is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { status } = await Location.getForegroundPermissionsAsync();
      console.log('[OnboardingLocation] Permission status:', status);
      setLocationGranted(status === 'granted');
      setIsLoading(false);
    } catch (error) {
      console.error('[OnboardingLocation] Error checking location permission:', error);
      console.error('[OnboardingLocation] Error details:', JSON.stringify(error, null, 2));
      // Set to false on error to allow user to continue
      setLocationGranted(false);
      setIsLoading(false);
    }
  };

  // Pre-fill with restored data if available
  useEffect(() => {
    console.log('[OnboardingLocation] Component mounted');
    console.log('[OnboardingLocation] onboardingData:', onboardingData);

    // Check if location permission already granted
    checkLocationPermission().catch((err) => {
      console.error('[OnboardingLocation] useEffect error:', err);
      setIsLoading(false);
    });
  }, []);

  const handleValidate = async () => {
    try {
      // If permission already granted, just proceed
      if (locationGranted) {
        const location = onboardingData?.location || 'Location enabled';
        return { location };
      }

      // Request location permission
      setIsRequestingPermission(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
          console.log('Location permission granted');
          setLocationGranted(true);

          // Try to get actual location
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });

            // Reverse geocode to get city name
            const [address] = await Location.reverseGeocodeAsync({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });

            const locationString =
              address.city && address.region
                ? `${address.city}, ${address.region}`
                : 'Location enabled';

            console.log('Got location:', locationString);
            return { location: locationString };
          } catch (locError) {
            console.error('Error getting location:', locError);
            // Permission granted but couldn't get location - that's okay
            return { location: 'Location enabled' };
          }
        } else if (status === 'denied') {
          // User explicitly denied permission
          Alert.alert(
            'Location Permission Required',
            'Harvest needs location access to show you nearby matches. You can continue without it, but your experience will be limited.',
            [
              {
                text: 'Continue Without Location',
                onPress: () => {
                  // Allow user to continue with a default location
                  setIsRequestingPermission(false);
                },
                style: 'cancel',
              },
              {
                text: 'Open Settings',
                onPress: async () => {
                  await Location.requestForegroundPermissionsAsync();
                  setIsRequestingPermission(false);
                },
              },
            ]
          );
          // Return default location to allow continuing
          return { location: 'Location not enabled' };
        } else {
          // Permission not granted but not explicitly denied
          console.log('Location permission not granted:', status);
          return { location: 'Location not enabled' };
        }
      } catch (error) {
        console.error('Error requesting location permission:', error);
        Alert.alert('Error', 'Failed to request location permission. You can continue without it.');
        return { location: 'Location not enabled' };
      } finally {
        setIsRequestingPermission(false);
      }
    } catch (outerError) {
      console.error('[OnboardingLocation] Critical error in handleValidate:', outerError);
      // Always return a valid object to allow progression
      setIsRequestingPermission(false);
      return { location: 'Location not enabled' };
    }
  };

  if (isLoading) {
    return (
      <OnboardingScreen
        progress={90}
        currentStep="location"
        nextStep="terms"
        onValidate={() => ({ location: 'Loading...' })}
        buttonDisabled={true}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading location settings...</Text>
        </View>
      </OnboardingScreen>
    );
  }

  return (
    <OnboardingScreen
      progress={90}
      currentStep="location"
      nextStep="terms"
      onValidate={handleValidate}
      buttonText={locationGranted ? 'Continue' : 'Allow Location'}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={locationGranted ? 'checkmark-circle' : 'location'}
          size={48}
          color={locationGranted ? theme.colors.accent : theme.colors.primary}
        />
      </View>
      <Text style={styles.title}>{locationGranted ? 'Location Enabled' : 'Enable Location'}</Text>
      <Text style={styles.subtitle}>
        {locationGranted
          ? 'Your location is enabled. Tap Continue to finish setup.'
          : 'Harvest needs location access to show you nearby matches. This will trigger a permission request from your device.'}
      </Text>
      {isRequestingPermission && (
        <Text style={styles.requestingText}>Requesting permission...</Text>
      )}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    marginBottom: 32,
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    marginTop: 48,
  },
  loadingText: {
    color: '#666',
    fontFamily: 'System',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  requestingText: {
    color: theme.colors.primary,
    fontFamily: 'System',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: '#555',
    fontFamily: 'System',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
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
