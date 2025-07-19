import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  style?: ViewStyle;
}

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  label,
  disabled = false,
  activeColor = theme.colors.primary,
  inactiveColor = theme.colors.border,
  style,
}) => {
  const translateX = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    translateX.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [value]);

  const animatedTrackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      translateX.value,
      [0, 1],
      [inactiveColor, activeColor]
    ),
  }));

  const animatedThumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: translateX.value * 20,
      },
    ],
  }));

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.track,
          animatedTrackStyle,
          disabled && styles.disabled,
        ]}
      >
        <Animated.View style={[styles.thumb, animatedThumbStyle]} />
      </Animated.View>
      {label && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 4,
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    ...theme.shadows.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  labelDisabled: {
    color: theme.colors.text.tertiary,
  },
});