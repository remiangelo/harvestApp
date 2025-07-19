import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface AvatarProps {
  source?: ImageSourcePropType | string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  name?: string;
  showBadge?: boolean;
  badgeColor?: string;
  style?: ViewStyle;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 'medium',
  name,
  showBadge = false,
  badgeColor = theme.colors.success,
  style,
  fallbackIcon = 'person',
}) => {
  const sizes = {
    small: 40,
    medium: 56,
    large: 80,
    xlarge: 120,
  };

  const avatarSize = sizes[size];
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '';

  const renderContent = () => {
    if (source) {
      const imageSource = typeof source === 'string' ? { uri: source } : source;
      return <Image source={imageSource} style={styles.image} resizeMode="cover" />;
    }

    if (initials) {
      return (
        <Text style={[styles.initials, { fontSize: avatarSize * 0.4 }]}>{initials}</Text>
      );
    }

    return (
      <Ionicons
        name={fallbackIcon}
        size={avatarSize * 0.5}
        color={theme.colors.text.inverse}
      />
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
        },
        style,
      ]}
    >
      {renderContent()}
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeColor,
              width: avatarSize * 0.3,
              height: avatarSize * 0.3,
              borderRadius: (avatarSize * 0.3) / 2,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.bold,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
});