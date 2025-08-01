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
        maxDistance:
          (currentUser as any).distance_preference || (currentUser as any).maxDistance || 50,
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

    Alert.alert('Filters Updated', 'Your preferences have been saved!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset Filters', 'Are you sure you want to reset to default filters?', [
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
        },
      },
    ]);
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
                setFilters((prev) => ({
                  ...prev,
                  ageRange: {
                    ...prev.ageRange,
                    min: Math.min(value, prev.ageRange.max - 1),
                  },
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
                setFilters((prev) => ({
                  ...prev,
                  ageRange: {
                    ...prev.ageRange,
                    max: Math.max(value, prev.ageRange.min + 1),
                  },
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
              setFilters((prev) => ({
                ...prev,
                maxDistance: value,
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
                  filters.interestedIn === option.value && styles.selectedGenderOption,
                ]}
                onPress={() => setFilters((prev) => ({ ...prev, interestedIn: option.value }))}
              >
                <Text
                  style={[
                    styles.genderOptionText,
                    filters.interestedIn === option.value && styles.selectedGenderOptionText,
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
                While turned off, you will not be shown in the card stack but can still see and
                message your existing matches
              </Text>
            </View>
            <Toggle
              value={filters.showMe}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, showMe: value }))}
            />
          </View>
        </View>

        {/* Global Filters Notice */}
        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={theme.colors.text.secondary}
          />
          <Text style={styles.noticeText}>
            These are global filters. Only people who meet your criteria will see you and vice
            versa.
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
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  distanceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  distanceLabel: {
    color: theme.colors.text.tertiary,
    fontSize: 12,
  },
  distanceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  distanceText: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  genderOption: {
    alignItems: 'center',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    margin: 6,
    minWidth: '45%',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  genderOptionText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  notice: {
    alignItems: 'flex-start',
    backgroundColor: '#f9f9f9',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  noticeText: {
    color: theme.colors.text.secondary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 8,
  },
  rangeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  rangeSeparator: {
    color: theme.colors.text.secondary,
    fontSize: 24,
    marginHorizontal: 16,
  },
  rangeText: {
    color: theme.colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  resetButton: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    borderBottomColor: '#f5f5f5',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectedGenderOption: {
    backgroundColor: `${theme.colors.primary}15`,
    borderColor: theme.colors.primary,
  },
  selectedGenderOptionText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  slider: {
    height: 40,
    width: '100%',
  },
  sliderContainer: {
    marginVertical: 8,
  },
  sliderLabel: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  toggleDescription: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleTitle: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
});
