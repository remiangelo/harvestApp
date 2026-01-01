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
import useSubscriptionStore from '../stores/useSubscriptionStore';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';

type FiltersState = {
  ageRange: { min: number; max: number };
  maxDistance: number;
  distanceUnit: 'miles' | 'km';
  allOfUS: boolean;
  interestedIn: string;
  showMe: boolean;
  lookingFor: string;
  heightRange: { min: number; max: number };
  smoking: string;
  drinking: string;
  cannabis: string;
  spiritualOrientation: string;
  childrenStatus: string;
};

const defaultFilters: FiltersState = {
  ageRange: { min: 18, max: 50 },
  maxDistance: 50,
  distanceUnit: 'miles',
  allOfUS: false,
  interestedIn: 'all',
  showMe: true,
  lookingFor: 'all',
  heightRange: { min: 100, max: 250 },
  smoking: 'all',
  drinking: 'all',
  cannabis: 'all',
  spiritualOrientation: 'all',
  childrenStatus: 'all',
};

const GENDER_OPTIONS = [
  { value: 'male', label: 'Men' },
  { value: 'female', label: 'Women' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'all', label: 'Everyone' },
];

const LOOKING_FOR_OPTIONS = [
  { value: 'all', label: 'Any' },
  { value: 'dating', label: 'Dating' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'marriage', label: 'Marriage' },
];

const LIFESTYLE_OPTIONS = [
  { value: 'all', label: 'Any' },
  { value: 'never', label: 'Never' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'regularly', label: 'Regularly' },
];

const SPIRITUAL_OPTIONS = [
  { value: 'all', label: 'Any' },
  { value: 'spiritual_not_religious', label: 'Spiritual' },
  { value: 'christian', label: 'Christian' },
  { value: 'catholic', label: 'Catholic' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'hindu', label: 'Hindu' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'atheist', label: 'Atheist' },
  { value: 'agnostic', label: 'Agnostic' },
];

const CHILDREN_OPTIONS = [
  { value: 'all', label: 'Any' },
  { value: 'have_and_want_more', label: 'Has & wants more' },
  { value: 'have_and_dont_want_more', label: "Has & doesn't want more" },
  { value: 'want_kids', label: 'Wants kids' },
  { value: 'open_to_kids', label: 'Open to kids' },
  { value: 'dont_want_kids', label: "Doesn't want kids" },
];

export default function FiltersScreen() {
  const router = useRouter();
  const { currentUser, updateOnboardingData } = useUserStore();
  const { tier } = useSubscriptionStore();

  // Check if user has premium or gold tier
  const hasPremium = tier === 'green' || tier === 'gold';
  const hasGold = tier === 'gold';

  const [filters, setFilters] = useState<FiltersState>(defaultFilters);

  useEffect(() => {
    if (currentUser) {
      setFilters({
        ageRange: {
          min: (currentUser as any).agePreference?.min || 18,
          max: (currentUser as any).agePreference?.max || 50,
        },
        maxDistance:
          (currentUser as any).distance_preference || (currentUser as any).maxDistance || 50,
        distanceUnit: (currentUser as any).distanceUnit || 'miles',
        allOfUS: (currentUser as any).allOfUS || false,
        interestedIn: currentUser.preferences || 'all',
        showMe: (currentUser as any).showMe !== false,
        // Premium tier filters
        lookingFor: (currentUser as any).filter_looking_for || 'all',
        heightRange: {
          min: (currentUser as any).filter_height_min || 100,
          max: (currentUser as any).filter_height_max || 250,
        },
        smoking: (currentUser as any).filter_smoking || 'all',
        drinking: (currentUser as any).filter_drinking || 'all',
        cannabis: (currentUser as any).filter_cannabis || 'all',
        // Gold tier filters
        spiritualOrientation: (currentUser as any).filter_spiritual_orientation || 'all',
        childrenStatus: (currentUser as any).filter_children_status || 'all',
      });
    }
  }, [currentUser]);

  const handleSave = () => {
    // Update user preferences
    updateOnboardingData({
      agePreference: filters.ageRange,
      distance_preference: filters.allOfUS ? 9999 : filters.maxDistance,
      distanceUnit: filters.distanceUnit,
      allOfUS: filters.allOfUS,
      preferences: filters.interestedIn,
      showMe: filters.showMe,
      // Premium tier filters
      filter_looking_for: filters.lookingFor,
      filter_height_min: filters.heightRange.min,
      filter_height_max: filters.heightRange.max,
      filter_smoking: filters.smoking,
      filter_drinking: filters.drinking,
      filter_cannabis: filters.cannabis,
      // Gold tier filters
      filter_spiritual_orientation: filters.spiritualOrientation,
      filter_children_status: filters.childrenStatus,
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
          setFilters(defaultFilters);
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

          {/* Unit toggle */}
          <View style={styles.unitToggleContainer}>
            <TouchableOpacity
              style={[
                styles.unitButton,
                filters.distanceUnit === 'miles' && styles.unitButtonActive,
              ]}
              onPress={() => setFilters((prev) => ({ ...prev, distanceUnit: 'miles' }))}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  filters.distanceUnit === 'miles' && styles.unitButtonTextActive,
                ]}
              >
                Miles
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitButton, filters.distanceUnit === 'km' && styles.unitButtonActive]}
              onPress={() => setFilters((prev) => ({ ...prev, distanceUnit: 'km' }))}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  filters.distanceUnit === 'km' && styles.unitButtonTextActive,
                ]}
              >
                Kilometers
              </Text>
            </TouchableOpacity>
          </View>

          {/* All of US toggle */}
          <TouchableOpacity
            style={styles.allOfUSContainer}
            onPress={() => setFilters((prev) => ({ ...prev, allOfUS: !prev.allOfUS }))}
          >
            <View style={styles.checkboxContainer}>
              <View style={[styles.checkbox, filters.allOfUS && styles.checkboxChecked]}>
                {filters.allOfUS && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text style={styles.allOfUSText}>Search all of United States</Text>
            </View>
          </TouchableOpacity>

          {!filters.allOfUS && (
            <>
              <View style={styles.distanceContainer}>
                <Text style={styles.distanceText}>
                  {filters.maxDistance} {filters.distanceUnit === 'km' ? 'km' : 'miles'}
                </Text>
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
                <Text style={styles.distanceLabel}>
                  1 {filters.distanceUnit === 'km' ? 'km' : 'mile'}
                </Text>
                <Text style={styles.distanceLabel}>
                  500 {filters.distanceUnit === 'km' ? 'km' : 'miles'}
                </Text>
              </View>
            </>
          )}
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

        {/* Premium Tier Filters */}
        <View style={[styles.section, !hasPremium && styles.lockedSection]}>
          <View style={styles.tierHeader}>
            <Text style={styles.sectionTitle}>Premium Filters</Text>
            {!hasPremium && (
              <TouchableOpacity
                style={styles.upgradeChip}
                onPress={() => router.push('/subscriptions')}
              >
                <Ionicons name="lock-closed" size={14} color="white" />
                <Text style={styles.upgradeText}>Upgrade</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Looking For */}
          <Text style={styles.filterLabel}>Looking For</Text>
          <View style={styles.filterOptions}>
            {LOOKING_FOR_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  filters.lookingFor === option.value && styles.selectedFilterOption,
                ]}
                onPress={() =>
                  hasPremium && setFilters((prev) => ({ ...prev, lookingFor: option.value }))
                }
                disabled={!hasPremium}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filters.lookingFor === option.value && styles.selectedFilterOptionText,
                    !hasPremium && styles.disabledText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Height Range */}
          <Text style={styles.filterLabel}>Height (cm)</Text>
          <View style={styles.rangeContainer}>
            <Text style={[styles.rangeText, !hasPremium && styles.disabledText]}>
              {filters.heightRange.min}
            </Text>
            <Text style={styles.rangeSeparator}>-</Text>
            <Text style={[styles.rangeText, !hasPremium && styles.disabledText]}>
              {filters.heightRange.max}
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={100}
            maximumValue={250}
            step={1}
            value={filters.heightRange.min}
            onValueChange={(value) =>
              hasPremium &&
              setFilters((prev) => ({
                ...prev,
                heightRange: {
                  ...prev.heightRange,
                  min: Math.min(value, prev.heightRange.max - 1),
                },
              }))
            }
            minimumTrackTintColor={hasPremium ? theme.colors.primary : '#ccc'}
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor={hasPremium ? theme.colors.primary : '#ccc'}
            disabled={!hasPremium}
          />

          {/* Lifestyle Habits */}
          <Text style={styles.filterLabel}>Smoking</Text>
          <View style={styles.filterOptions}>
            {LIFESTYLE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.smallFilterOption,
                  filters.smoking === option.value && styles.selectedFilterOption,
                ]}
                onPress={() =>
                  hasPremium && setFilters((prev) => ({ ...prev, smoking: option.value }))
                }
                disabled={!hasPremium}
              >
                <Text
                  style={[
                    styles.smallFilterOptionText,
                    filters.smoking === option.value && styles.selectedFilterOptionText,
                    !hasPremium && styles.disabledText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Drinking</Text>
          <View style={styles.filterOptions}>
            {LIFESTYLE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.smallFilterOption,
                  filters.drinking === option.value && styles.selectedFilterOption,
                ]}
                onPress={() =>
                  hasPremium && setFilters((prev) => ({ ...prev, drinking: option.value }))
                }
                disabled={!hasPremium}
              >
                <Text
                  style={[
                    styles.smallFilterOptionText,
                    filters.drinking === option.value && styles.selectedFilterOptionText,
                    !hasPremium && styles.disabledText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Cannabis</Text>
          <View style={styles.filterOptions}>
            {LIFESTYLE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.smallFilterOption,
                  filters.cannabis === option.value && styles.selectedFilterOption,
                ]}
                onPress={() =>
                  hasPremium && setFilters((prev) => ({ ...prev, cannabis: option.value }))
                }
                disabled={!hasPremium}
              >
                <Text
                  style={[
                    styles.smallFilterOptionText,
                    filters.cannabis === option.value && styles.selectedFilterOptionText,
                    !hasPremium && styles.disabledText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Gold Tier Filters */}
        <View style={[styles.section, !hasGold && styles.lockedSection]}>
          <View style={styles.tierHeader}>
            <Text style={styles.sectionTitle}>Gold Filters</Text>
            {!hasGold && (
              <TouchableOpacity
                style={styles.upgradeChip}
                onPress={() => router.push('/subscriptions')}
              >
                <Ionicons name="lock-closed" size={14} color="white" />
                <Text style={styles.upgradeText}>Upgrade</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Spiritual Orientation */}
          <Text style={styles.filterLabel}>Spiritual/Faith Orientation</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.horizontalFilterOptions}>
              {SPIRITUAL_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.horizontalFilterOption,
                    filters.spiritualOrientation === option.value && styles.selectedFilterOption,
                  ]}
                  onPress={() =>
                    hasGold &&
                    setFilters((prev) => ({ ...prev, spiritualOrientation: option.value }))
                  }
                  disabled={!hasGold}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      filters.spiritualOrientation === option.value &&
                        styles.selectedFilterOptionText,
                      !hasGold && styles.disabledText,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Children Status */}
          <Text style={styles.filterLabel}>Children</Text>
          <View style={styles.filterOptions}>
            {CHILDREN_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  filters.childrenStatus === option.value && styles.selectedFilterOption,
                ]}
                onPress={() =>
                  hasGold && setFilters((prev) => ({ ...prev, childrenStatus: option.value }))
                }
                disabled={!hasGold}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filters.childrenStatus === option.value && styles.selectedFilterOptionText,
                    !hasGold && styles.disabledText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
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
  allOfUSContainer: {
    marginBottom: 20,
  },
  allOfUSText: {
    color: theme.colors.text.primary,
    fontSize: 16,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: theme.colors.primary,
    borderRadius: 4,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginRight: 12,
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  disabledText: {
    color: '#ccc',
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
  filterLabel: {
    color: theme.colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  filterOption: {
    alignItems: 'center',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    minWidth: '22%',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  filterOptionText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  horizontalFilterOption: {
    alignItems: 'center',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  horizontalFilterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  // New filter styles
  lockedSection: {
    opacity: 0.6,
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
  selectedFilterOption: {
    backgroundColor: `${theme.colors.primary}15`,
    borderColor: theme.colors.primary,
  },
  selectedFilterOptionText: {
    color: theme.colors.primary,
    fontWeight: '600',
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
  smallFilterOption: {
    alignItems: 'center',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: '22%',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  smallFilterOptionText: {
    color: theme.colors.text.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  tierHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  unitButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  unitButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  unitButtonText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  unitButtonTextActive: {
    color: 'white',
  },
  unitToggleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  upgradeChip: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  upgradeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
