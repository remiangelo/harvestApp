import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { theme } from '../constants/theme';
import { getSubscriptionTiers, SubscriptionTier, getTierComparison } from '../lib/subscription';
import useSubscriptionStore, { TierName } from '../stores/useSubscriptionStore';

// Screen dimensions available if needed for responsive layouts
const _screenWidth = Dimensions.get('window').width;

interface UpgradeModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade?: (tier: TierName) => void;
  highlightFeature?: 'matching' | 'gardener' | 'values' | 'filters' | 'likes';
  title?: string;
  subtitle?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  visible,
  onClose,
  onUpgrade,
  highlightFeature,
  title = 'Upgrade Your Experience',
  subtitle = 'Unlock more features and find meaningful connections',
}) => {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<TierName>('green');
  const [loading, setLoading] = useState(true);
  const { tier: currentTier } = useSubscriptionStore();

  useEffect(() => {
    if (visible) {
      loadTiers();
    }
  }, [visible]);

  const loadTiers = async () => {
    try {
      const tierData = await getSubscriptionTiers();
      setTiers(tierData.filter((t) => t.name !== 'seed')); // Don't show free tier in upgrade
      setLoading(false);
    } catch (error) {
      console.error('Error loading tiers:', error);
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    onUpgrade?.(selectedTier);
    // In a real app, this would open the payment flow
    // For now, just close the modal
    onClose();
  };

  const comparison = getTierComparison();

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'green':
        return 'leaf';
      case 'gold':
        return 'star';
      default:
        return 'seedling';
    }
  };

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'green':
        return theme.colors.accent;
      case 'gold':
        return '#FFD700';
      default:
        return theme.colors.text.secondary;
    }
  };

  const isCurrentTier = (tierName: string) => tierName === currentTier;
  const isBetterTier = (tierName: TierName) => {
    const tierOrder: TierName[] = ['seed', 'green', 'gold'];
    return tierOrder.indexOf(tierName) > tierOrder.indexOf(currentTier);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={20} style={styles.blurContainer}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
              >
                {/* Tier Cards */}
                <View style={styles.tierCardsContainer}>
                  {tiers.map((tier) => (
                    <TouchableOpacity
                      key={tier.id}
                      style={[
                        styles.tierCard,
                        selectedTier === tier.name && styles.tierCardSelected,
                        tier.name === 'gold' && styles.tierCardGold,
                      ]}
                      onPress={() => isBetterTier(tier.name) && setSelectedTier(tier.name)}
                      disabled={!isBetterTier(tier.name)}
                    >
                      {tier.name === 'gold' && (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularText}>BEST VALUE</Text>
                        </View>
                      )}
                      <View
                        style={[
                          styles.tierIconContainer,
                          { backgroundColor: getTierColor(tier.name) + '20' },
                        ]}
                      >
                        <Ionicons
                          name={getTierIcon(tier.name) as any}
                          size={28}
                          color={getTierColor(tier.name)}
                        />
                      </View>
                      <Text style={styles.tierName}>{tier.display_name}</Text>
                      <Text style={styles.tierPrice}>
                        ${tier.price_monthly.toFixed(2)}
                        <Text style={styles.tierPricePeriod}>/mo</Text>
                      </Text>
                      <Text style={styles.tierYearly}>or ${tier.price_yearly.toFixed(2)}/year</Text>
                      {isCurrentTier(tier.name) && (
                        <View style={styles.currentTierBadge}>
                          <Text style={styles.currentTierText}>CURRENT</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Feature Comparison */}
                <View style={styles.comparisonSection}>
                  <Text style={styles.comparisonTitle}>What you get</Text>
                  {comparison.map((item, index) => {
                    const selectedValue = selectedTier === 'green' ? item.green : item.gold;
                    const isHighlighted =
                      (highlightFeature === 'matching' && item.feature.includes('Match')) ||
                      (highlightFeature === 'gardener' && item.feature.includes('Gardener')) ||
                      (highlightFeature === 'values' && item.feature.includes('Values')) ||
                      (highlightFeature === 'filters' && item.feature.includes('filter')) ||
                      (highlightFeature === 'likes' && item.feature.includes('liked'));

                    return (
                      <View
                        key={index}
                        style={[
                          styles.comparisonRow,
                          isHighlighted && styles.comparisonRowHighlighted,
                        ]}
                      >
                        <Text style={styles.comparisonFeature}>{item.feature}</Text>
                        <View style={styles.comparisonValue}>
                          {selectedValue !== '-' ? (
                            <>
                              <Ionicons
                                name="checkmark-circle"
                                size={18}
                                color={theme.colors.accent}
                              />
                              <Text style={styles.comparisonValueText}>{selectedValue}</Text>
                            </>
                          ) : (
                            <Ionicons
                              name="close-circle"
                              size={18}
                              color={theme.colors.text.tertiary}
                            />
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            )}

            {/* Upgrade Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.upgradeButton, selectedTier === 'gold' && styles.upgradeButtonGold]}
                onPress={handleUpgrade}
              >
                <Text style={styles.upgradeButtonText}>
                  Upgrade to {selectedTier === 'green' ? 'Green' : 'Gold'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.footerNote}>
                Cancel anytime. Subscription renews automatically.
              </Text>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 10,
  },
  comparisonFeature: {
    color: theme.colors.text.primary,
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
  },
  comparisonRow: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  comparisonRowHighlighted: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  },
  comparisonSection: {
    marginTop: 24,
  },
  comparisonTitle: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 18,
    marginBottom: 12,
  },
  comparisonValue: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  comparisonValueText: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  currentTierBadge: {
    backgroundColor: theme.colors.text.tertiary,
    borderRadius: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  currentTierText: {
    color: '#fff',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
  },
  footer: {
    backgroundColor: theme.colors.background,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    paddingBottom: 32,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  footerNote: {
    color: theme.colors.text.tertiary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 200,
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    ...theme.shadows.xl,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
  },
  popularBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 4,
    left: -8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
    top: -8,
  },
  popularText: {
    color: '#000',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  tierCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: 16,
    borderWidth: 2,
    flex: 1,
    marginHorizontal: 6,
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  tierCardGold: {
    borderColor: '#FFD700',
  },
  tierCardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  tierCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tierIconContainer: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginBottom: 8,
    width: 48,
  },
  tierName: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
    marginBottom: 4,
  },
  tierPrice: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 20,
  },
  tierPricePeriod: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
  },
  tierYearly: {
    color: theme.colors.text.tertiary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    marginTop: 2,
  },
  title: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 24,
    textAlign: 'center',
  },
  upgradeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  upgradeButtonGold: {
    backgroundColor: '#FFD700',
  },
  upgradeButtonText: {
    color: '#000',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 18,
  },
});

export default UpgradeModal;
