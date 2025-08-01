import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../../constants/theme';

interface LiquidGlassBadgeProps {
  label: string;
  value?: string | number;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'solid' | 'glass';
  textStyle?: TextStyle;
}

export const LiquidGlassBadge: React.FC<LiquidGlassBadgeProps> = ({
  label,
  value,
  color = theme.colors.primary,
  size = 'medium',
  variant = 'glass',
  textStyle,
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { width: 32, height: 32 },
          text: { fontSize: 12 },
          label: { fontSize: 9 },
        };
      case 'large':
        return {
          container: { width: 48, height: 48 },
          text: { fontSize: 18 },
          label: { fontSize: 12 },
        };
      default:
        return {
          container: { width: 40, height: 40 },
          text: { fontSize: 14 },
          label: { fontSize: 11 },
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          sizeStyles.container,
          variant === 'solid' && { borderColor: color },
        ]}
      >
        {variant === 'glass' && (
          <>
            <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFillObject} />
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)']}
              style={StyleSheet.absoluteFillObject}
            />
          </>
        )}
        {variant === 'solid' && (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: color, opacity: 0.1 }]} />
        )}
        <Text style={[styles.text, sizeStyles.text, textStyle]}>{value || label}</Text>
      </View>
      {value && <Text style={[styles.label, sizeStyles.label]}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  text: {
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  label: {
    color: '#666',
  },
});