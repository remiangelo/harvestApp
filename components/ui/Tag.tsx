import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';

interface TagProps {
  label: string;
  onPress?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium';
  selected?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Tag: React.FC<TagProps> = ({
  label,
  onPress,
  variant = 'default',
  size = 'medium',
  selected = false,
  icon,
  style,
  textStyle,
}) => {
  const tagStyles = [
    styles.base,
    styles[variant],
    styles[size],
    selected && styles.selected,
    selected && styles[`${variant}Selected`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    selected && styles.selectedText,
    textStyle,
  ];

  const TagWrapper = onPress ? TouchableOpacity : View;

  return (
    <TagWrapper style={tagStyles} onPress={onPress} activeOpacity={0.8}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={textStyles}>
        {size === 'small' || label.startsWith('#') ? label : `#${label}`}
      </Text>
    </TagWrapper>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
  },

  // Variants
  default: {
    backgroundColor: theme.colors.secondaryLight,
  },

  primary: {
    backgroundColor: theme.colors.primary,
  },

  secondary: {
    backgroundColor: theme.colors.secondary,
  },

  outline: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.border,
    borderWidth: 1,
  },

  // Sizes
  small: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },

  medium: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },

  // Text styles
  text: {
    fontWeight: theme.typography.fontWeight.medium,
  },

  defaultText: {
    color: theme.colors.text.secondary,
  },

  primaryText: {
    color: theme.colors.text.inverse,
  },

  secondaryText: {
    color: theme.colors.text.primary,
  },

  outlineText: {
    color: theme.colors.text.secondary,
  },

  smallText: {
    fontSize: theme.typography.fontSize.xs,
  },

  mediumText: {
    fontSize: theme.typography.fontSize.sm,
  },

  // Selected states
  selected: {
    borderWidth: 2,
  },

  defaultSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },

  primarySelected: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primary,
  },

  secondarySelected: {
    backgroundColor: theme.colors.secondaryDark,
    borderColor: theme.colors.primary,
  },

  outlineSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },

  selectedText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  // Icon
  icon: {
    marginRight: theme.spacing.xs,
  },
});

export { Tag };
