import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { theme } from '../constants/theme';
import useUserStore from '../stores/useUserStore';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'all', label: 'Everyone' },
];

export default function FiltersScreen() {
  const router = useRouter();
  const { currentUser, updateOnboardingData } = useUserStore();
  
  const [filters, setFilters] = useState({
    ageRange: { min: 18, max: 50 },
    maxDistance: 50,
    interestedIn: 'all',
    showMe: true,
  });

  useEffect(() => {
    if (currentUser) {
      setFilters({
        ageRange: {
          min: (currentUser as any).agePreference?.min || 18,
          max: (currentUser as any).agePreference?.max || 50,
        },
        maxDistance: (currentUser as any).distance_preference || (currentUser as any).maxDistance || 50,
        interestedIn: currentUser.preferences || 'all',
        showMe: (currentUser as any).showMe !== false,
      });
    }
  }, [currentUser]);

  const handleSave = () => {
    // Update user preferences
    updateOnboardingData({
      agePreference: filters.ageRange,
      distance_preference: filters.maxDistance,
      preferences: filters.interestedIn,
      showMe: filters.showMe,
    } as any);

    Alert.alert(
      'Filters Updated',
      'Your preferences have been saved!',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Filters',
      'Are you sure you want to reset to default filters?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setFilters({
              ageRange: { min: 18, max: 50 },
              maxDistance: 50,
              interestedIn: 'all',
              showMe: true,
            });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetButton}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Age Range Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Range</Text>
          <View style={styles.rangeContainer}>
            <Text style={styles.rangeText}>{filters.ageRange.min}</Text>
            <Text style={styles.rangeSeparator}>-</Text>
            <Text style={styles.rangeText}>{filters.ageRange.max}</Text>
          </View>
          
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Minimum Age</Text>
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={99}
              step={1}
              value={filters.ageRange.min}
              onValueChange={(value) => {
                setFilters(prev => ({
                  ...prev,
                  ageRange: {
                    ...prev.ageRange,
                    min: Math.min(value, prev.ageRange.max - 1)
                  }
                }));
              }}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor="#e0e0e0"
              thumbTintColor={theme.colors.primary}
            />
          </View>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Maximum Age</Text>
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={99}
              step={1}
              value={filters.ageRange.max}
              onValueChange={(value) => {
                setFilters(prev => ({
                  ...prev,
                  ageRange: {
                    ...prev.ageRange,
                    max: Math.max(value, prev.ageRange.min + 1)
                  }
                }));
              }}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor="#e0e0e0"
              thumbTintColor={theme.colors.primary}
            />
          </View>
        </View>

        {/* Distance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Maximum Distance</Text>
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>{filters.maxDistance} miles</Text>
          </View>
          
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={500}
            step={1}
            value={filters.maxDistance}
            onValueChange={(value) => {
              setFilters(prev => ({
                ...prev,
                maxDistance: value
              }));
            }}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor={theme.colors.primary}
          />
          
          <View style={styles.distanceLabels}>
            <Text style={styles.distanceLabel}>1 mile</Text>
            <Text style={styles.distanceLabel}>500 miles</Text>
          </View>
        </View>

        {/* Show Me Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Show Me</Text>
          <View style={styles.genderOptions}>
            {GENDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.genderOption,
                  filters.interestedIn === option.value && styles.selectedGenderOption
                ]}
                onPress={() => setFilters(prev => ({ ...prev, interestedIn: option.value }))}
              >
                <Text
                  style={[
                    styles.genderOptionText,
                    filters.interestedIn === option.value && styles.selectedGenderOptionText
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visibility Section */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Show me on Harvest</Text>
              <Text style={styles.toggleDescription}>
                While turned off, you will not be shown in the card stack but can still see and message your existing matches
              </Text>
            </View>
            <Toggle
              value={filters.showMe}
              onValueChange={(value) => setFilters(prev => ({ ...prev, showMe: value }))}
            />
          </View>
        </View>

        {/* Global Filters Notice */}
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.text.secondary} />
          <Text style={styles.noticeText}>
            These are global filters. Only people who meet your criteria will see you and vice versa.
          </Text>
        </View>

        {/* Save Button */}
        <View style={styles.bottomSection}>
          <Button title="Save Preferences" onPress={handleSave} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  resetButton: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  rangeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  rangeSeparator: {
    fontSize: 24,
    color: theme.colors.text.secondary,
    marginHorizontal: 16,
  },
  sliderContainer: {
    marginVertical: 8,
  },
  sliderLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  distanceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  distanceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  distanceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  distanceLabel: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  genderOption: {
    flex: 1,
    minWidth: '45%',
    margin: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  selectedGenderOption: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}15`,
  },
  genderOptionText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  selectedGenderOptionText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f9f9f9',
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginLeft: 8,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
});