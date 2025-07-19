import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelPosition?: 'top' | 'center' | 'bottom';
  animated?: boolean;
  delay?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = theme.colors.primary,
  backgroundColor = theme.colors.border,
  showLabel = false,
  labelPosition = 'top',
  animated = true,
  delay = 0,
  style,
}) => {
  const animatedWidth = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      animatedWidth.value = withDelay(
        delay,
        withTiming(progress, { duration: 1000 })
      );
    } else {
      animatedWidth.value = progress;
    }
  }, [progress, animated, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={style}>
      {showLabel && labelPosition === 'top' && (
        <Text style={[styles.label, styles.labelTop]}>{`${Math.round(clampedProgress)}%`}</Text>
      )}
      
      <View
        style={[
          styles.container,
          {
            height,
            backgroundColor,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progress,
            {
              height,
              backgroundColor: color,
              borderRadius: height / 2,
            },
            animated ? animatedStyle : { width: `${clampedProgress}%` },
          ]}
        />
        
        {showLabel && labelPosition === 'center' && (
          <View style={styles.centerLabelContainer}>
            <Text style={[styles.label, styles.labelCenter]}>
              {`${Math.round(clampedProgress)}%`}
            </Text>
          </View>
        )}
      </View>
      
      {showLabel && labelPosition === 'bottom' && (
        <Text style={[styles.label, styles.labelBottom]}>{`${Math.round(clampedProgress)}%`}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  centerLabelContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  labelTop: {
    marginBottom: 4,
    color: theme.colors.text.primary,
  },
  labelCenter: {
    color: theme.colors.text.inverse,
  },
  labelBottom: {
    marginTop: 4,
    color: theme.colors.text.primary,
  },
});