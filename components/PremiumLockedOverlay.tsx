import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface PremiumLockedOverlayProps {
  onUpgrade: () => void;
  featureName?: string;
  description?: string;
  compact?: boolean;
}

export const PremiumLockedOverlay: React.FC<PremiumLockedOverlayProps> = ({
  onUpgrade,
  featureName = 'Values-Based Matching',
  description = 'Upgrade to Green tier to unlock this premium feature',
  compact = false,
}) => {
  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <BlurView intensity={80} tint="light" style={styles.compactBlur}>
          <View style={styles.compactContent}>
            <View style={styles.lockIconSmall}>
              <Ionicons name="lock-closed" size={16} color={theme.colors.primary} />
            </View>
            <Text style={styles.compactText}>Premium Feature</Text>
            <TouchableOpacity style={styles.compactButton} onPress={onUpgrade}>
              <Text style={styles.compactButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blurView}>
        <View style={styles.content}>
          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.featureName}>{featureName}</Text>
          <Text style={styles.description}>{description}</Text>
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Ionicons name="leaf" size={20} color="#000" />
            <Text style={styles.upgradeButtonText}>Upgrade to Green</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  blurView: {
    alignItems: 'center',
    borderRadius: 16,
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  compactBlur: {
    alignItems: 'center',
    borderRadius: 12,
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  compactButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  compactButtonText: {
    color: '#000',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
  },
  compactContainer: {
    borderRadius: 12,
    height: '100%',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
  },
  compactContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  compactText: {
    color: theme.colors.text.secondary,
    flex: 1,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 13,
  },
  container: {
    borderRadius: 16,
    height: '100%',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  description: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  featureName: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 18,
    marginBottom: 8,
    marginTop: 12,
    textAlign: 'center',
  },
  lockIcon: {
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  lockIconSmall: {
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  upgradeButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: 24,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    ...theme.shadows.md,
  },
  upgradeButtonText: {
    color: '#000',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
  },
});

export default PremiumLockedOverlay;
