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
    backgroundColor: interpolateColor(translateX.value, [0, 1], [inactiveColor, activeColor]),
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
      <Animated.View style={[styles.track, animatedTrackStyle, disabled && styles.disabled]}>
        <Animated.View style={[styles.thumb, animatedThumbStyle]} />
      </Animated.View>
      {label && <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: theme.colors.text.primary,
    fontSize: 16,
    marginLeft: 12,
  },
  labelDisabled: {
    color: theme.colors.text.tertiary,
  },
  thumb: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    height: 20,
    width: 20,
    ...theme.shadows.sm,
  },
  track: {
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    padding: 4,
    width: 48,
  },
});
