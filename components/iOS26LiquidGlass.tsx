import React, { useMemo } from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// iOS 26 Liquid Glass intensity presets
type GlassIntensity = 'subtle' | 'light' | 'medium' | 'strong' | 'intense';

interface iOS26LiquidGlassProps extends ViewProps {
  // iOS 26 intensity presets
  intensity?: GlassIntensity;
  // Physics-based properties
  blur?: number;
  saturation?: number;
  luminosity?: number;
  cornerRadius?: number;
  borderWidth?: number;
  borderOpacity?: number;
  shadowIntensity?: number;
  // Advanced effects
  useAdvancedEffects?: boolean;
  chromaticAberration?: number;
  displacementScale?: number;
  // Custom colors
  tint?: 'light' | 'dark' | 'default';
  gradientColors?: string[];
}

const INTENSITY_PRESETS: Record<GlassIntensity, {
  blur: number;
  saturation: number;
  luminosity: number;
  borderOpacity: number;
  shadowIntensity: number;
  gradientColors: string[];
}> = {
  subtle: {
    blur: 12,
    saturation: 95,
    luminosity: 98,
    borderOpacity: 0.1,
    shadowIntensity: 0.05,
    gradientColors: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'],
  },
  light: {
    blur: 18,
    saturation: 90,
    luminosity: 95,
    borderOpacity: 0.15,
    shadowIntensity: 0.08,
    gradientColors: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.08)'],
  },
  medium: {
    blur: 24,
    saturation: 85,
    luminosity: 92,
    borderOpacity: 0.2,
    shadowIntensity: 0.12,
    gradientColors: ['rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0.12)'],
  },
  strong: {
    blur: 32,
    saturation: 80,
    luminosity: 88,
    borderOpacity: 0.25,
    shadowIntensity: 0.15,
    gradientColors: ['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.18)'],
  },
  intense: {
    blur: 40,
    saturation: 75,
    luminosity: 85,
    borderOpacity: 0.3,
    shadowIntensity: 0.2,
    gradientColors: ['rgba(255, 255, 255, 0.55)', 'rgba(255, 255, 255, 0.25)'],
  },
};

export const iOS26LiquidGlass: React.FC<iOS26LiquidGlassProps> = ({
  children,
  style,
  intensity = 'light',
  blur,
  saturation,
  luminosity,
  cornerRadius = 20,
  borderWidth = 0.5,
  borderOpacity,
  shadowIntensity,
  useAdvancedEffects = true,
  chromaticAberration = 0.02,
  displacementScale = 8,
  tint = 'light',
  gradientColors,
  ...props
}) => {
  const glassConfig = useMemo(() => {
    const preset = INTENSITY_PRESETS[intensity];
    
    return {
      blur: blur ?? preset.blur,
      saturation: saturation ?? preset.saturation,
      luminosity: luminosity ?? preset.luminosity,
      borderOpacity: borderOpacity ?? preset.borderOpacity,
      shadowIntensity: shadowIntensity ?? preset.shadowIntensity,
      gradientColors: gradientColors ?? preset.gradientColors,
    };
  }, [intensity, blur, saturation, luminosity, borderOpacity, shadowIntensity, gradientColors]);

  const containerStyle = useMemo(() => ({
    borderRadius: cornerRadius,
    shadowOpacity: glassConfig.shadowIntensity,
    shadowRadius: glassConfig.blur * 0.25,
    elevation: Math.round(glassConfig.shadowIntensity * 25),
    borderWidth,
    borderColor: `rgba(255, 255, 255, ${glassConfig.borderOpacity})`,
  }), [glassConfig, cornerRadius, borderWidth]);

  const chromaticStyle = useMemo(() => {
    if (!useAdvancedEffects || chromaticAberration === 0) return {};
    
    // Simulate chromatic aberration with multiple subtle shadows
    return {
      shadowColor: '#FF0000',
      shadowOffset: { width: chromaticAberration, height: 0 },
      shadowOpacity: 0.02,
      shadowRadius: 1,
    };
  }, [useAdvancedEffects, chromaticAberration]);

  return (
    <View
      {...props}
      style={[
        styles.container,
        containerStyle,
        chromaticStyle,
        style,
      ]}
    >
      {/* Main blur layer with iOS 26 optimized settings */}
      <BlurView 
        intensity={glassConfig.blur} 
        tint={tint} 
        style={StyleSheet.absoluteFillObject}
        experimentalBlurMethod="dimezisBlurView"
      />
      
      {/* Primary gradient layer */}
      <LinearGradient
        colors={glassConfig.gradientColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Advanced physics effects layer */}
      {useAdvancedEffects && (
        <>
          {/* Fresnel reflection simulation */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.8)',
              'transparent',
              'transparent',
              'rgba(255, 255, 255, 0.1)'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              StyleSheet.absoluteFillObject,
              { opacity: 0.3 }
            ]}
          />
          
          {/* Surface normal highlight */}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.4)',
              'transparent'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.3 }}
            style={[
              StyleSheet.absoluteFillObject,
              { opacity: 0.6 }
            ]}
          />
        </>
      )}
      
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  content: {
    flex: 1,
  },
});
