import { useEffect, useState, useRef, useCallback } from 'react';
import { Keyboard, Platform, Animated, KeyboardEvent, EmitterSubscription } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface UseKeyboardOptions {
  /** Whether the screen has a bottom tab bar (70px) */
  hasTabBar?: boolean;
  /** Extra padding to add when keyboard is hidden */
  extraPadding?: number;
}

interface UseKeyboardReturn {
  /** Current keyboard height (0 when hidden) */
  keyboardHeight: number;
  /** Whether keyboard is currently visible */
  isKeyboardVisible: boolean;
  /** Animated value for keyboard height - use for smooth animations */
  keyboardAnimatedHeight: Animated.Value;
  /** Safe area insets */
  insets: ReturnType<typeof useSafeAreaInsets>;
  /** Bottom offset when keyboard is hidden (safe area + tab bar) */
  bottomOffsetWhenHidden: number;
}

const TAB_BAR_HEIGHT = 70;
const MIN_BOTTOM_PADDING = 8;

/**
 * Hook for tracking keyboard height with smooth animations.
 *
 * Provides real-time keyboard height tracking using platform-appropriate
 * events (keyboardWillShow on iOS, keyboardDidShow on Android).
 *
 * @example
 * ```tsx
 * const { keyboardAnimatedHeight, isKeyboardVisible, bottomOffsetWhenHidden } = useKeyboard({
 *   hasTabBar: true,
 * });
 *
 * // Use in Animated.View
 * <Animated.View style={{ bottom: keyboardAnimatedHeight }}>
 *   <InputBar />
 * </Animated.View>
 * ```
 */
export const useKeyboard = (options: UseKeyboardOptions = {}): UseKeyboardReturn => {
  const { hasTabBar = false, extraPadding = 0 } = options;
  const insets = useSafeAreaInsets();

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Calculate bottom offset when keyboard is hidden
  const bottomOffsetWhenHidden =
    Math.max(insets.bottom, MIN_BOTTOM_PADDING) + (hasTabBar ? TAB_BAR_HEIGHT : 0) + extraPadding;

  // Animated value starts at the hidden state offset
  const keyboardAnimatedHeight = useRef(new Animated.Value(bottomOffsetWhenHidden)).current;

  // Track current animation to allow cancellation
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const handleKeyboardShow = useCallback(
    (event: KeyboardEvent) => {
      // Cancel any ongoing animation
      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }

      const keyboardHeightValue = event.endCoordinates.height;
      setKeyboardHeight(keyboardHeightValue);
      setIsKeyboardVisible(true);

      // iOS provides animation duration, Android keyboard is already animated
      const duration = Platform.OS === 'ios' ? event.duration || 250 : 100;

      currentAnimation.current = Animated.timing(keyboardAnimatedHeight, {
        toValue: keyboardHeightValue,
        duration,
        useNativeDriver: false, // Must be false for layout animations
      });

      currentAnimation.current.start(() => {
        currentAnimation.current = null;
      });
    },
    [keyboardAnimatedHeight]
  );

  const handleKeyboardHide = useCallback(
    (event: KeyboardEvent) => {
      // Cancel any ongoing animation
      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }

      setKeyboardHeight(0);
      setIsKeyboardVisible(false);

      // iOS provides animation duration, Android keyboard is already animated
      const duration = Platform.OS === 'ios' ? event.duration || 250 : 100;

      currentAnimation.current = Animated.timing(keyboardAnimatedHeight, {
        toValue: bottomOffsetWhenHidden,
        duration,
        useNativeDriver: false,
      });

      currentAnimation.current.start(() => {
        currentAnimation.current = null;
      });
    },
    [keyboardAnimatedHeight, bottomOffsetWhenHidden]
  );

  useEffect(() => {
    // Update animated value when bottomOffsetWhenHidden changes (e.g., safe area changes)
    if (!isKeyboardVisible) {
      keyboardAnimatedHeight.setValue(bottomOffsetWhenHidden);
    }
  }, [bottomOffsetWhenHidden, isKeyboardVisible, keyboardAnimatedHeight]);

  useEffect(() => {
    // Use platform-appropriate events
    // iOS: keyboardWillShow/Hide fires BEFORE animation (smoother)
    // Android: keyboardDidShow/Hide fires AFTER animation
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const subscriptions: EmitterSubscription[] = [
      Keyboard.addListener(showEvent, handleKeyboardShow),
      Keyboard.addListener(hideEvent, handleKeyboardHide),
    ];

    return () => {
      subscriptions.forEach((sub) => sub.remove());
      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }
    };
  }, [handleKeyboardShow, handleKeyboardHide]);

  return {
    keyboardHeight,
    isKeyboardVisible,
    keyboardAnimatedHeight,
    insets,
    bottomOffsetWhenHidden,
  };
};
