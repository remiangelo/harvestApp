import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../../constants/theme';

interface LiquidGlassButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  title: string;
  textStyle?: TextStyle;
  gradientColors?: string[];
  blurIntensity?: number;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  title,
  style,
  textStyle,
  gradientColors,
  blurIntensity = 60,
  disabled,
  ...props
}) => {
  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return gradientColors || [theme.colors.primary, theme.colors.secondary];
      case 'secondary':
        return gradientColors || ['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)'];
      case 'ghost':
        return gradientColors || ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'];
      default:
        return gradientColors || [theme.colors.primary, theme.colors.secondary];
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: 16,
          paddingVertical: 8,
          minHeight: 36,
        };
      case 'large':
        return {
          paddingHorizontal: 32,
          paddingVertical: 16,
          minHeight: 56,
        };
      default:
        return {
          paddingHorizontal: 24,
          paddingVertical: 12,
          minHeight: 44,
        };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
      fontWeight: '600',
      color: variant === 'primary' ? 'white' : theme.colors.text.primary,
    };
    return { ...baseStyle, ...textStyle };
  };

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled}
      style={[
        styles.container,
        getSizeStyles(),
        disabled && styles.disabled,
        style,
      ]}
    >
      {variant !== 'primary' && (
        <BlurView intensity={blurIntensity} tint="light" style={StyleSheet.absoluteFillObject} />
      )}
      <LinearGradient
        colors={getVariantColors() as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.5,
  },
});