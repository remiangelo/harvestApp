import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
  /** Whether screen has bottom tab bar */
  hasTabBar?: boolean;
  /** Whether to show the attach button */
  showAttachButton?: boolean;
  /** Max character length */
  maxLength?: number;
  /** Custom content to render instead of input (e.g., upgrade button) */
  customContent?: React.ReactNode;
  /** Callback when input bar height changes */
  onHeightChange?: (height: number) => void;

  /**
   * Optional explicit tab bar height if you want it precise.
   * If not provided and hasTabBar=true, a sensible default is used.
   */
  tabBarHeight?: number;
}

// Estimated base height for layout calculations
export const CHAT_INPUT_BAR_BASE_HEIGHT = 60;

// Fallback tab bar height (only used if hasTabBar=true and tabBarHeight not provided)
const DEFAULT_TAB_BAR_HEIGHT = 70;

/**
 * Chat input bar as a NORMAL footer (no absolute positioning).
 *
 * IMPORTANT:
 * - Place this directly UNDER your FlatList in a column layout.
 * - Let the parent screen handle the keyboard (KeyboardAvoidingView / adjustResize).
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
  tabBarHeight,
}) => {
  const insets = useSafeAreaInsets();
  const { isKeyboardVisible } = useKeyboard({ hasTabBar });
  const [_inputHeight, setInputHeight] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setInputHeight(height);
    onHeightChange?.(height);
  };

  const canSend = value.trim().length > 0 && !disabled;

  /**
   * Bottom spacing rules:
   * - If keyboard is visible:
   *    - iOS still needs bottom safe-area padding (home indicator) to avoid slight overlap.
   *    - Android: parent adjustResize handles it; no extra padding needed.
   * - If keyboard is hidden:
   *    - with tab bar: add padding so the input sits above the tab bar overlay.
   *    - without tab bar: add safe-area inset (home indicator).
   */
  // CustomTabBar reserves its own layout space, so we only need safe-area
  // padding (home indicator) — not the full tab bar height.
  const bottomPadWhenHidden = insets.bottom;

  const containerBottomPadding =
    Platform.OS === 'ios'
      ? isKeyboardVisible
        ? insets.bottom
        : bottomPadWhenHidden
      : isKeyboardVisible
        ? 0
        : bottomPadWhenHidden;

  return (
    <View
      style={[styles.outerContainer, { paddingBottom: containerBottomPadding }]}
      onLayout={handleLayout}
    >
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFillObject} />

      <View style={styles.contentWrapper}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  attachButton: {
    marginBottom: 6,
    marginRight: 8,
  },
  contentWrapper: {
    paddingBottom: 8,
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
  outerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 0,
    overflow: 'hidden',
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
