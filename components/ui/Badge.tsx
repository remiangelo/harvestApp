import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface BadgeProps {
  value: string | number;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  dot?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  value,
  variant = 'primary',
  size = 'medium',
  dot = false,
  style,
  textStyle,
}) => {
  const variantColors = {
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    info: theme.colors.info,
  };

  const sizes = {
    small: {
      minWidth: dot ? 8 : 18,
      height: dot ? 8 : 18,
      paddingHorizontal: dot ? 0 : 6,
      fontSize: 10,
    },
    medium: {
      minWidth: dot ? 10 : 22,
      height: dot ? 10 : 22,
      paddingHorizontal: dot ? 0 : 8,
      fontSize: 12,
    },
    large: {
      minWidth: dot ? 12 : 28,
      height: dot ? 12 : 28,
      paddingHorizontal: dot ? 0 : 10,
      fontSize: 14,
    },
  };

  const sizeStyle = sizes[size];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: variantColors[variant],
          minWidth: sizeStyle.minWidth,
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          borderRadius: sizeStyle.height / 2,
        },
        style,
      ]}
    >
      {!dot && (
        <Text style={[styles.text, { fontSize: sizeStyle.fontSize }, textStyle]} numberOfLines={1}>
          {value}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  text: {
    color: theme.colors.text.inverse,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
