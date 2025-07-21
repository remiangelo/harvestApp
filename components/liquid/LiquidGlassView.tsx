import React from 'react';
import { View, ViewStyle, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface LiquidGlassViewProps {
  children: React.ReactNode;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  style?: ViewStyle;
  glassTint?: string;
  gradientColors?: string[];
  borderRadius?: number;
}

export const LiquidGlassView: React.FC<LiquidGlassViewProps> = ({
  children,
  intensity = 80,
  tint = 'light',
  style,
  glassTint,
  gradientColors,
  borderRadius = 16,
}) => {
  const defaultGradient = tint === 'dark' 
    ? ['rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.05)']
    : ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)'];

  const colors = gradientColors || defaultGradient;

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webGlass, { borderRadius }, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[{ borderRadius, overflow: 'hidden' }, style]}>
      <BlurView 
        intensity={intensity} 
        tint={tint}
        style={StyleSheet.absoluteFillObject}
      />
      {glassTint && (
        <View 
          style={[
            StyleSheet.absoluteFillObject, 
            { backgroundColor: glassTint }
          ]} 
        />
      )}
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  webGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
});