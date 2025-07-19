import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { theme } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    isDisabled && styles[`${variant}Disabled`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? theme.colors.text.inverse : theme.colors.primary}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <View style={styles.iconLeft}>{icon}</View>
            )}
            <Text style={textStyles}>{title}</Text>
            {icon && iconPosition === 'right' && (
              <View style={styles.iconRight}>{icon}</View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  fullWidth: {
    width: '100%',
  },
  
  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.md,
  },
  
  secondary: {
    backgroundColor: theme.colors.secondary,
    ...theme.shadows.sm,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  
  medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  
  large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 56,
  },
  
  // Text styles
  text: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  primaryText: {
    color: theme.colors.text.inverse,
  },
  
  secondaryText: {
    color: theme.colors.text.primary,
  },
  
  outlineText: {
    color: theme.colors.primary,
  },
  
  ghostText: {
    color: theme.colors.primary,
  },
  
  smallText: {
    fontSize: theme.typography.fontSize.sm,
  },
  
  mediumText: {
    fontSize: theme.typography.fontSize.base,
  },
  
  largeText: {
    fontSize: theme.typography.fontSize.lg,
  },
  
  // Disabled states
  disabled: {
    opacity: 0.6,
  },
  
  primaryDisabled: {
    backgroundColor: theme.colors.primaryLight,
  },
  
  secondaryDisabled: {
    backgroundColor: theme.colors.secondaryLight,
  },
  
  outlineDisabled: {
    borderColor: theme.colors.border,
  },
  
  ghostDisabled: {
    opacity: 0.4,
  },
  
  disabledText: {
    color: theme.colors.text.tertiary,
  },
  
  // Icons
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
});