import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { useKeyboard } from '../../hooks/useKeyboard';

interface ChatInputBarProps {
  /** Current input value */
  value: string;
  /** Callback when text changes */
  onChangeText: (text: string) => void;
  /** Callback when send button is pressed */
  onSend: () => void;
  /** Callback when attach button is pressed (optional) */
  onAttach?: () => void;
  /** Input placeholder text */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether screen has bottom tab bar (adds 70px offset) */
  hasTabBar?: boolean;
  /** Whether to show the attach button */
  showAttachButton?: boolean;
  /** Max character length */
  maxLength?: number;
  /** Custom content to render instead of input (e.g., upgrade button) */
  customContent?: React.ReactNode;
  /** Callback when input bar height changes */
  onHeightChange?: (height: number) => void;
}

// Estimated base height for layout calculations
export const CHAT_INPUT_BAR_BASE_HEIGHT = 60;

/**
 * Shared chat input bar component with keyboard-aware positioning.
 *
 * Uses absolute positioning and animates with keyboard height for
 * zero-gap keyboard attachment on both iOS and Android.
 */
export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  value,
  onChangeText,
  onSend,
  onAttach,
  placeholder = 'Type a message...',
  disabled = false,
  hasTabBar = false,
  showAttachButton = true,
  maxLength = 1000,
  customContent,
  onHeightChange,
}) => {
  const insets = useSafeAreaInsets();
  const { keyboardAnimatedHeight, isKeyboardVisible } = useKeyboard({ hasTabBar });
  const [inputHeight, setInputHeight] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setInputHeight(height);
    onHeightChange?.(height);
  };

  const canSend = value.trim().length > 0 && !disabled;

  // Calculate safe area padding:
  // - When keyboard is visible: no padding needed (keyboard provides safe area)
  // - When keyboard is hidden AND no tab bar: need padding for home indicator
  // - When keyboard is hidden AND has tab bar: no padding (tab bar provides safe area)
  const safeAreaPadding = isKeyboardVisible || hasTabBar ? 0 : insets.bottom;

  return (
    <Animated.View
      style={[styles.container, { bottom: keyboardAnimatedHeight }]}
      onLayout={handleLayout}
    >
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFillObject} />

      {/* Safe area spacer - only when keyboard hidden */}
      <View style={[styles.contentWrapper, { paddingBottom: safeAreaPadding }]}>
        {customContent ? (
          <View style={styles.customContentWrapper}>{customContent}</View>
        ) : (
          <View style={styles.inputRow}>
            {showAttachButton && onAttach && (
              <TouchableOpacity style={styles.attachButton} onPress={onAttach} disabled={disabled}>
                <Ionicons
                  name="add-circle"
                  size={28}
                  color={disabled ? '#ccc' : theme.colors.primary}
                />
              </TouchableOpacity>
            )}

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#999"
                multiline
                maxLength={maxLength}
                editable={!disabled}
                contextMenuHidden={Platform.OS === 'ios'}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
              onPress={onSend}
              disabled={!canSend}
            >
              <Ionicons name="send" size={24} color={canSend ? theme.colors.primary : '#ccc'} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  attachButton: {
    marginBottom: 6,
    marginRight: 8,
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
  },
  contentWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  customContentWrapper: {
    paddingVertical: 8,
  },
  input: {
    color: '#333',
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingBottom: 8,
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    elevation: 2,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sendButton: {
    marginBottom: 6,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatInputBar;
