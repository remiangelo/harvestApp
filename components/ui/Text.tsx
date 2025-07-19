import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { theme } from '../../constants/theme';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodyLarge' | 'bodySmall' | 'caption';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success';
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  style?: TextStyle;
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  align,
  weight,
  style,
  children,
  ...textProps
}) => {
  const textStyles = [
    styles.base,
    variantStyles[variant],
    colorStyles[color],
    align && { textAlign: align },
    weight && { fontWeight: theme.typography.fontWeight[weight] },
    style,
  ];

  return (
    <RNText style={textStyles} {...textProps}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: theme.typography.fontFamily.regular,
  },
});

const variantStyles = StyleSheet.create({
  h1: theme.typography.headers.h1,
  h2: theme.typography.headers.h2,
  h3: theme.typography.headers.h3,
  h4: theme.typography.headers.h4,
  body: theme.typography.body.regular,
  bodyLarge: theme.typography.body.large,
  bodySmall: theme.typography.body.small,
  caption: theme.typography.body.caption,
});

const colorStyles = StyleSheet.create({
  primary: { color: theme.colors.text.primary },
  secondary: { color: theme.colors.text.secondary },
  tertiary: { color: theme.colors.text.tertiary },
  inverse: { color: theme.colors.text.inverse },
  error: { color: theme.colors.error },
  success: { color: theme.colors.success },
});