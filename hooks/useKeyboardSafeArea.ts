import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface UseKeyboardSafeAreaOptions {
  hasTabBar?: boolean; // Whether screen has bottom tab bar (70px)
  extraPadding?: number; // Additional padding if needed
}

/**
 * Hook for handling keyboard and safe area calculations in chat screens
 *
 * Provides consistent keyboard handling across iOS and Android by:
 * - Calculating proper bottom padding (safe area + tab bar)
 * - Returning correct KeyboardAvoidingView behavior per platform
 * - Providing proper keyboard vertical offset
 *
 * @param options Configuration options
 * @returns Keyboard and safe area values for chat UI
 */
export const useKeyboardSafeArea = (options: UseKeyboardSafeAreaOptions = {}) => {
  const { hasTabBar = false, extraPadding = 0 } = options;
  const insets = useSafeAreaInsets();

  const TAB_BAR_HEIGHT = 70; // From CLAUDE.md - standard tab bar height
  const MIN_PADDING = 8;

  // Calculate bottom padding for input bar
  // Formula: max(safe area bottom, min padding) + tab bar (if present) + extra padding
  const bottomPadding =
    Math.max(insets.bottom, MIN_PADDING) + (hasTabBar ? TAB_BAR_HEIGHT : 0) + extraPadding;

  // KeyboardAvoidingView behavior - platform specific
  // iOS: 'padding' pushes content up
  // Android: 'height' resizes container
  const keyboardBehavior = Platform.select({
    ios: 'padding' as const,
    android: 'height' as const,
  });

  // Keyboard vertical offset - accounts for header on iOS
  // iOS needs header height offset, Android handles automatically
  const getKeyboardVerticalOffset = (headerHeight: number = 0) => {
    return (
      Platform.select({
        ios: headerHeight || insets.top + 60, // Status bar + approximate header
        android: 0,
      }) || 0
    );
  };

  return {
    bottomPadding,
    keyboardBehavior,
    getKeyboardVerticalOffset,
    insets,
  };
};
