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
  /**
   * Animated bottom offset to apply to absolute-positioned UI (like your ChatInputBar).
   * iOS: follows keyboard height.
   * Android: 0 while keyboard visible (because window already resizes).
   */
  keyboardAnimatedHeight: Animated.Value;
  /** Safe area insets */
  insets: ReturnType<typeof useSafeAreaInsets>;
  /** Bottom offset when keyboard is hidden (safe area + tab bar) */
  bottomOffsetWhenHidden: number;
}

const TAB_BAR_HEIGHT = 70;

export const useKeyboard = (options: UseKeyboardOptions = {}): UseKeyboardReturn => {
  const { hasTabBar = false, extraPadding = 0 } = options;
  const insets = useSafeAreaInsets();

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // When keyboard is hidden, you may want to sit above the tab bar.
  const bottomOffsetWhenHidden = (hasTabBar ? TAB_BAR_HEIGHT : 0) + extraPadding;

  // This value is meant to be used for "bottom:" on absolutely positioned elements.
  // Start at the hidden offset.
  const keyboardAnimatedHeight = useRef(new Animated.Value(bottomOffsetWhenHidden)).current;

  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const animateTo = useCallback(
    (toValue: number, duration: number) => {
      if (currentAnimation.current) currentAnimation.current.stop();

      currentAnimation.current = Animated.timing(keyboardAnimatedHeight, {
        toValue,
        duration,
        useNativeDriver: false,
      });

      currentAnimation.current.start(() => {
        currentAnimation.current = null;
      });
    },
    [keyboardAnimatedHeight]
  );

  const handleKeyboardShow = useCallback(
    (event: KeyboardEvent) => {
      const h = event.endCoordinates?.height ?? 0;
      setKeyboardHeight(h);
      setIsKeyboardVisible(true);

      // iOS needs to follow the keyboard for perfect attachment.
      // Android should NOT shift by keyboard height because the window resizes (adjustResize).
      const targetBottom = Platform.OS === 'ios' ? h : 0;

      const duration = Platform.OS === 'ios' ? event.duration || 250 : 100;
      animateTo(targetBottom, duration);
    },
    [animateTo]
  );

  const handleKeyboardHide = useCallback(
    (event: KeyboardEvent) => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);

      const duration = Platform.OS === 'ios' ? event.duration || 250 : 100;
      animateTo(bottomOffsetWhenHidden, duration);
    },
    [animateTo, bottomOffsetWhenHidden]
  );

  useEffect(() => {
    // If tab bar / padding changes while keyboard is hidden, keep bar in correct place.
    if (!isKeyboardVisible) {
      keyboardAnimatedHeight.setValue(bottomOffsetWhenHidden);
    }
  }, [bottomOffsetWhenHidden, isKeyboardVisible, keyboardAnimatedHeight]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const subs: EmitterSubscription[] = [
      Keyboard.addListener(showEvent, handleKeyboardShow),
      Keyboard.addListener(hideEvent, handleKeyboardHide),
    ];

    return () => {
      subs.forEach((s) => s.remove());
      if (currentAnimation.current) currentAnimation.current.stop();
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
