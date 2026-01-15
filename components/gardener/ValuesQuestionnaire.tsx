import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { theme } from '../../constants/theme';
import { useAuthStore } from '../../stores/useAuthStore';
import useSubscriptionStore from '../../stores/useSubscriptionStore';
import {
  Value,
  getAllValues,
  getUserValuesBrought,
  getUserValuesSought,
  saveUserValuesBrought,
  saveUserValuesSought,
} from '../../lib/values';
import { LiquidGlassView } from '../liquid/LiquidGlassView';
import { UpgradeModal } from '../UpgradeModal';

type ValueType = 'brought' | 'sought';

export const ValuesQuestionnaire: React.FC = () => {
  const { user } = useAuthStore();
  const hasValuesMatching = useSubscriptionStore((state) => state.hasValuesMatching);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ValueType>('brought');
  const [allValues, setAllValues] = useState<Value[]>([]);
  const [selectedBrought, setSelectedBrought] = useState<string[]>([]);
  const [selectedSought, setSelectedSought] = useState<string[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load all available values
      const { data: valuesData } = await getAllValues();
      if (valuesData) {
        setAllValues(valuesData);
      }

      // Load user's existing values
      const { data: broughtData } = await getUserValuesBrought(user.id);
      if (broughtData) {
        setSelectedBrought(broughtData.map((v) => v.value_id));
      }

      const { data: soughtData } = await getUserValuesSought(user.id);
      if (soughtData) {
        setSelectedSought(soughtData.map((v) => v.value_id));
      }
    } catch (error) {
      console.error('[ValuesQuestionnaire] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleValue = (valueId: string) => {
    const selected = activeTab === 'brought' ? selectedBrought : selectedSought;
    const setSelected = activeTab === 'brought' ? setSelectedBrought : setSelectedSought;

    if (selected.includes(valueId)) {
      // Remove value
      setSelected(selected.filter((id) => id !== valueId));
    } else {
      // Add value (max 5)
      if (selected.length >= 5) {
        Alert.alert('Maximum Reached', 'You can select up to 5 values.');
        return;
      }
      setSelected([...selected, valueId]);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save values.');
      return;
    }

    if (selectedBrought.length === 0 || selectedSought.length === 0) {
      Alert.alert(
        'Incomplete',
        'Please select at least one value for both what you bring and what you seek.'
      );
      return;
    }

    try {
      setSaving(true);

      // Save values brought (ranked by selection order)
      const broughtValues = selectedBrought.map((valueId, index) => ({
        value_id: valueId,
        ranking: index + 1,
      }));
      const { error: broughtError } = await saveUserValuesBrought(user.id, broughtValues);

      if (broughtError) throw broughtError;

      // Save values sought (ranked by selection order)
      const soughtValues = selectedSought.map((valueId, index) => ({
        value_id: valueId,
        ranking: index + 1,
      }));
      const { error: soughtError } = await saveUserValuesSought(user.id, soughtValues);

      if (soughtError) throw soughtError;

      Alert.alert('Values Saved', 'Your values have been saved successfully!');
    } catch (error) {
      console.error('[ValuesQuestionnaire] Error saving:', error);
      Alert.alert('Error', 'Failed to save values. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const groupValuesByCategory = (values: Value[]) => {
    const grouped: { [key: string]: Value[] } = {};
    values.forEach((value) => {
      if (!grouped[value.category]) {
        grouped[value.category] = [];
      }
      grouped[value.category].push(value);
    });
    return grouped;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading values...</Text>
      </View>
    );
  }

  // Show locked screen for free tier users
  if (!hasValuesMatching()) {
    return (
      <View style={styles.container}>
        <View style={styles.lockedContainer}>
          <BlurView intensity={60} tint="light" style={styles.lockedBlur}>
            <View style={styles.lockedContent}>
              <View style={styles.lockIconLarge}>
                <Ionicons name="lock-closed" size={48} color={theme.colors.primary} />
              </View>
              <Text style={styles.lockedTitle}>Values-Based Matching</Text>
              <Text style={styles.lockedSubtitle}>Premium Feature</Text>
              <Text style={styles.lockedDescription}>
                Unlock the power of values-based matching to find partners who share what matters
                most to you. Define the values you bring and the values you seek in a relationship.
              </Text>
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Ionicons name="gift" size={20} color={theme.colors.accent} />
                  <Text style={styles.featureText}>Share 5 values you bring</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="search" size={20} color={theme.colors.accent} />
                  <Text style={styles.featureText}>Define 5 values you seek</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="heart" size={20} color={theme.colors.accent} />
                  <Text style={styles.featureText}>Get matched on shared values</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => setShowUpgradeModal(true)}
              >
                <Ionicons name="leaf" size={22} color="#000" />
                <Text style={styles.upgradeButtonText}>Upgrade to Green</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
        <UpgradeModal
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          highlightFeature="values"
          title="Unlock Values Matching"
          subtitle="Find partners who share what matters most to you"
        />
      </View>
    );
  }

  const groupedValues = groupValuesByCategory(allValues);
  const selectedValues = activeTab === 'brought' ? selectedBrought : selectedSought;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LiquidGlassView
        intensity={70}
        tint="light"
        style={styles.header as any}
        borderRadius={16}
        glassTint="rgba(255, 255, 255, 0.95)"
      >
        <Text style={styles.title}>Values-Based Matching</Text>
        <Text style={styles.subtitle}>
          Select up to 5 values for each category to help us find your best matches
        </Text>
      </LiquidGlassView>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'brought' && styles.activeTab]}
          onPress={() => setActiveTab('brought')}
        >
          <Ionicons
            name="gift"
            size={20}
            color={activeTab === 'brought' ? 'white' : theme.colors.primary}
          />
          <Text style={[styles.tabText, activeTab === 'brought' && styles.activeTabText]}>
            What I Bring
          </Text>
          {selectedBrought.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{selectedBrought.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'sought' && styles.activeTab]}
          onPress={() => setActiveTab('sought')}
        >
          <Ionicons
            name="search"
            size={20}
            color={activeTab === 'sought' ? 'white' : theme.colors.primary}
          />
          <Text style={[styles.tabText, activeTab === 'sought' && styles.activeTabText]}>
            What I Seek
          </Text>
          {selectedSought.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{selectedSought.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Values List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedValues).map(([category, values]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.toUpperCase()}</Text>

            <View style={styles.valuesGrid}>
              {values.map((value) => {
                const isSelected = selectedValues.includes(value.id);
                const selectionIndex = selectedValues.indexOf(value.id);

                return (
                  <TouchableOpacity
                    key={value.id}
                    style={[styles.valueCard, isSelected && styles.selectedValueCard]}
                    onPress={() => toggleValue(value.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.valueHeader}>
                      <Text style={[styles.valueName, isSelected && styles.selectedValueName]}>
                        {value.name}
                      </Text>
                      {isSelected && (
                        <View style={styles.rankBadge}>
                          <Text style={styles.rankText}>{selectionIndex + 1}</Text>
                        </View>
                      )}
                    </View>
                    {value.description && (
                      <Text
                        style={[
                          styles.valueDescription,
                          isSelected && styles.selectedValueDescription,
                        ]}
                      >
                        {value.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text style={styles.saveButtonText}>Save My Values</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  activeTabText: {
    color: 'white',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  container: {
    flex: 1,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 6,
  },
  countText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  featureList: {
    marginBottom: 24,
    marginTop: 20,
    width: '100%',
  },
  featureText: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 15,
  },
  header: {
    marginBottom: 20,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
    marginTop: 12,
  },
  lockIconLarge: {
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    marginBottom: 20,
    width: 96,
  },
  lockedBlur: {
    alignItems: 'center',
    borderRadius: 24,
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  lockedContainer: {
    borderRadius: 24,
    flex: 1,
    marginTop: 20,
    overflow: 'hidden',
  },
  lockedContent: {
    alignItems: 'center',
    padding: 32,
  },
  lockedDescription: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  lockedSubtitle: {
    color: theme.colors.accent,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  lockedTitle: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 28,
    textAlign: 'center',
  },
  rankBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    minWidth: 24,
  },
  rankText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 96, // Tab bar (56px) + extra padding (40px)
  },
  scrollView: {
    flex: 1,
  },
  selectedValueCard: {
    backgroundColor: `${theme.colors.primary}15`,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  selectedValueDescription: {
    color: theme.colors.primary,
  },
  selectedValueName: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  subtitle: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  tab: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: theme.colors.primary,
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  tabText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  upgradeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: 28,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 16,
    ...theme.shadows.md,
  },
  upgradeButtonText: {
    color: '#000',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 17,
  },
  valueCard: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  valueDescription: {
    color: theme.colors.text.tertiary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  valueHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueName: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  valuesGrid: {
    gap: 8,
  },
});
