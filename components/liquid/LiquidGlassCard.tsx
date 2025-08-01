import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface LiquidGlassCardProps extends ViewProps {
  blurIntensity?: number;
  tint?: 'light' | 'dark' | 'default';
  gradientColors?: string[];
  borderRadius?: number;
  elevation?: number;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  style,
  blurIntensity = 70,
  tint = 'light',
  gradientColors = ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.15)'],
  borderRadius = 20,
  elevation = 5,
  ...props
}) => {
  return (
    <View
      {...props}
      style={[
        styles.container,
        {
          borderRadius,
          elevation,
          shadowOpacity: elevation > 0 ? 0.1 : 0,
        },
        style,
      ]}
    >
      <BlurView intensity={blurIntensity} tint={tint} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 8,
  },
  content: {
    flex: 1,
  },
});