import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
  padding = 'medium',
  margin = 'none',
}) => {
  const cardStyles = [
    styles.base,
    styles[variant],
    styles[`padding_${padding}`],
    styles[`margin_${margin}`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  
  // Variants
  elevated: {
    ...theme.shadows.md,
  },
  
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  filled: {
    backgroundColor: theme.colors.secondaryLight,
  },
  
  // Padding
  padding_none: {
    padding: 0,
  },
  
  padding_small: {
    padding: theme.spacing.sm,
  },
  
  padding_medium: {
    padding: theme.spacing.md,
  },
  
  padding_large: {
    padding: theme.spacing.lg,
  },
  
  // Margin
  margin_none: {
    margin: 0,
  },
  
  margin_small: {
    margin: theme.spacing.sm,
  },
  
  margin_medium: {
    margin: theme.spacing.md,
  },
  
  margin_large: {
    margin: theme.spacing.lg,
  },
});