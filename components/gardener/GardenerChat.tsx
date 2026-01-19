import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useGardenerStore } from '../../stores/useGardenerStore';
import { theme } from '../../constants/theme';
import { gardenerService } from '../../lib/ai/gardenerService';
import { gardenerChatService } from '../../lib/gardenerSupabase';
import { useAuthStore } from '../../stores/useAuthStore';
import useSubscriptionStore from '../../stores/useSubscriptionStore';
import { UpgradeModal } from '../UpgradeModal';
import { formatLimitMessage } from '../../lib/subscription';
import { ChatInputBar, CHAT_INPUT_BAR_BASE_HEIGHT } from '../chat';

// Keep this: used for padding logic (tab bar slides away when keyboard is up)
import { useKeyboard } from '../../hooks/useKeyboard';
import { useKeyboardSafeArea } from '../../hooks/useKeyboardSafeArea';

import GARDENER_AVATAR from '../../assets/images/unnamed.png';

// Must match your tab bar height (only used when keyboard hidden)
const TAB_BAR_HEIGHT = 70;

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'gardener';
  timestamp: Date;
}

interface GardenerChatProps {
  onBack?: () => void;
}

export const GardenerChat: React.FC<GardenerChatProps> = ({ onBack }) => {
  const { chatHistory, addChatMessage } = useGardenerStore();
  const { user } = useAuthStore();

  const {
    tier,
    canUseGardener,
    incrementGardenerUsage,
    fetchSubscription,
    fetchUsage,
    canUseGardenerCharacters,
    addGardenerCharacters,
    getGardenerCharactersRemaining,
  } = useSubscriptionStore();

  const hasTabBar = !onBack;

  const [inputBarHeight, setInputBarHeight] = useState(CHAT_INPUT_BAR_BASE_HEIGHT);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your dating coach, The Gardener. I'm here to help you cultivate meaningful connections and grow in your dating journey. What would you like to talk about today?",
      sender: 'gardener',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const flatListRef = useRef<FlatList<Message>>(null);

  const { isKeyboardVisible } = useKeyboard({ hasTabBar });
  const { keyboardBehavior, getKeyboardVerticalOffset } = useKeyboardSafeArea({ hasTabBar });

  // FlatList padding so messages never sit under input (or tab bar when visible)
  const listContentPaddingBottom = useMemo(() => {
    const tabBarPadding = hasTabBar && !isKeyboardVisible ? TAB_BAR_HEIGHT : 0;
    return inputBarHeight + tabBarPadding + 16; // breathing room
  }, [inputBarHeight, hasTabBar, isKeyboardVisible]);

  // Only scroll when needed:
  // - first load / history load (content size changes)
  // - keyboard opens / layout shrinks (content size changes)
  // - input grows (content size changes)
  const scrollToBottom = useCallback((animated = false) => {
    flatListRef.current?.scrollToEnd({ animated });
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchSubscription(user.id);
      fetchUsage(user.id);
    }
  }, [user?.id, fetchSubscription, fetchUsage]);

  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);

        if (user?.id) {
          const dbHistory = await gardenerChatService.getChatHistory(user.id);

          if (dbHistory.length > 0) {
            const formattedHistory: Message[] = dbHistory.map((msg) => ({
              id: msg.id || `${Date.now()}-${Math.random()}`,
              text: msg.message,
              sender: msg.sender,
              timestamp: new Date(msg.created_at || Date.now()),
            }));
            setMessages(formattedHistory);
          } else if (chatHistory.length > 0) {
            const formattedHistory: Message[] = chatHistory.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            }));
            setMessages(formattedHistory);
          }
        } else {
          // test mode
          if (chatHistory.length > 0) {
            const formattedHistory: Message[] = chatHistory.map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            }));
            setMessages(formattedHistory);
          }
        }
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [user?.id, chatHistory]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim()) return;

    const userMessageText = inputText.trim();
    const userMessageLength = userMessageText.length;

    if (!canUseGardener()) {
      setLimitReached(true);
      const limitMessage = formatLimitMessage('gardener', tier, 0);

      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}`, text: limitMessage, sender: 'gardener', timestamp: new Date() },
      ]);

      setShowUpgradeModal(true);
      return;
    }

    const estimatedTotalChars = userMessageLength * 2.5;
    if (!canUseGardenerCharacters(estimatedTotalChars)) {
      const remaining = getGardenerCharactersRemaining();
      const limitMessage =
        tier === 'gold'
          ? `You've reached your daily character limit (30,000 chars). Your limit will reset tomorrow!`
          : `You've used your character limit for this conversation (${remaining} chars remaining). ${
              tier === 'seed'
                ? 'Upgrade to Green for longer conversations!'
                : 'Upgrade to Gold for unlimited conversations!'
            }`;

      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}`, text: limitMessage, sender: 'gardener', timestamp: new Date() },
      ]);

      setShowUpgradeModal(true);
      return;
    }

    const userMessage: Message = {
      id: `${Date.now()}`,
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    addChatMessage({ text: userMessage.text, sender: 'user' });
    setInputText('');
    setIsTyping(true);

    if (user?.id) {
      await gardenerChatService.saveMessage(user.id, userMessage.text, 'user');
    }

    try {
      if (user?.id) await incrementGardenerUsage(user.id);
      if (user?.id) await addGardenerCharacters(user.id, userMessageLength);

      const historyForAI = [...messages, userMessage].slice(-10).map((msg) => ({
        role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.text,
      }));

      const response = await gardenerService.getChatResponse(userMessage.text, historyForAI);

      const aiMessage: Message = {
        id: `${Date.now() + 1}`,
        text: response,
        sender: 'gardener',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      addChatMessage({ text: aiMessage.text, sender: 'gardener' });

      if (user?.id) await gardenerChatService.saveMessage(user.id, response, 'gardener');
      if (user?.id) await addGardenerCharacters(user.id, response.length);

      if (!canUseGardener()) setLimitReached(true);

      if (!canUseGardenerCharacters(100)) {
        const limitMessage =
          tier === 'gold'
            ? "You've reached your daily character limit. Your limit will reset tomorrow!"
            : `You've reached your character limit for this conversation. ${
                tier === 'seed'
                  ? 'Upgrade to Green for longer conversations!'
                  : 'Upgrade to Gold for unlimited conversations!'
              }`;

        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now() + 2}`,
            text: limitMessage,
            sender: 'gardener',
            timestamp: new Date(),
          },
        ]);
        setLimitReached(true);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsTyping(false);
      // Scrolling is handled by FlatList onContentSizeChange below, only when needed.
    }
  }, [
    inputText,
    canUseGardener,
    canUseGardenerCharacters,
    getGardenerCharactersRemaining,
    tier,
    messages,
    addChatMessage,
    user?.id,
    incrementGardenerUsage,
    addGardenerCharacters,
  ]);

  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (!dateObj || isNaN(dateObj.getTime())) return '';
      return dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  const renderMessage = ({ item: message }: { item: Message }) => (
    <View
      style={[
        styles.messageWrapper,
        message.sender === 'user' ? styles.userMessageWrapper : styles.gardenerMessageWrapper,
      ]}
    >
      {message.sender === 'gardener' && (
        <View style={styles.avatarContainer}>
          <Image source={GARDENER_AVATAR} style={styles.messageAvatar} />
        </View>
      )}

      <View
        style={[
          styles.messageBubble,
          message.sender === 'user' ? styles.userMessage : styles.gardenerMessage,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.sender === 'user' ? styles.userMessageText : styles.gardenerMessageText,
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            message.sender === 'user' ? styles.userTimestamp : styles.gardenerTimestamp,
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    return (
      <View style={[styles.messageWrapper, styles.gardenerMessageWrapper]}>
        <View style={styles.avatarContainer}>
          <Image source={GARDENER_AVATAR} style={styles.messageAvatar} />
        </View>
        <View style={[styles.messageBubble, styles.gardenerMessage, styles.typingBubble]}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      </View>
    );
  };

  const ScreenBody = (
    <View style={styles.body}>
      <FlatList
        ref={flatListRef}
        style={styles.list}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: listContentPaddingBottom },
        ]}
        ListHeaderComponent={renderTypingIndicator()}
        // This covers:
        // - first load
        // - history load
        // - keyboard open (layout shrinks)
        // - input bar height changes
        onContentSizeChange={() => scrollToBottom(false)}
      />

      <ChatInputBar
        value={inputText}
        onChangeText={setInputText}
        onSend={sendMessage}
        placeholder="Ask for dating advice..."
        hasTabBar={hasTabBar}
        tabBarHeight={TAB_BAR_HEIGHT}
        showAttachButton={false}
        maxLength={500}
        disabled={isTyping}
        onHeightChange={setInputBarHeight}
        customContent={
          limitReached ? (
            <TouchableOpacity
              style={styles.upgradeInputButton}
              onPress={() => setShowUpgradeModal(true)}
            >
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={styles.upgradeInputButtonText}>Upgrade to continue chatting</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        highlightFeature="gardener"
        title="Unlock More Gardener Conversations"
        subtitle="Get unlimited AI dating advice with Gold"
      />

      {onBack && (
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark, theme.colors.primaryDark]}
          style={styles.header}
        >
          <SafeAreaView style={styles.headerSafe}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>The Gardener</Text>
                <Text style={styles.headerSubtitle}>AI Dating Coach</Text>
              </View>
              <View style={styles.headerAvatar}>
                <Image source={GARDENER_AVATAR} style={styles.avatar} />
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      )}

      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={keyboardBehavior}
          keyboardVerticalOffset={getKeyboardVerticalOffset(onBack ? 0 : 0)}
        >
          {ScreenBody}
        </KeyboardAvoidingView>
      ) : (
        ScreenBody
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: { borderRadius: 18, height: 36, width: 36 },
  avatarContainer: { marginRight: 8 },
  backButton: { marginRight: 8, padding: 8 },
  body: { flex: 1 },
  container: { backgroundColor: '#f5f5f5', flex: 1 },

  gardenerMessage: { backgroundColor: '#f0f0f0', borderBottomLeftRadius: 4 },
  gardenerMessageText: { color: '#333' },
  gardenerMessageWrapper: { justifyContent: 'flex-start' },
  gardenerTimestamp: { color: '#999' },

  header: { paddingBottom: 10 },
  headerAvatar: { marginLeft: 12 },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 5,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerInfo: { flex: 1 },
  headerSafe: { marginTop: 0 },
  headerSubtitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, marginTop: 2 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '600' },

  list: { flex: 1 },

  messageAvatar: { borderRadius: 16, height: 32, width: 32 },
  messageBubble: { borderRadius: 16, maxWidth: '75%', padding: 12 },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageWrapper: { flexDirection: 'row', marginBottom: 12 },

  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  timestamp: { fontSize: 11, marginTop: 4 },
  typingBubble: { paddingHorizontal: 24, paddingVertical: 16 },

  upgradeInputButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: 20,
    flex: 1,
    flexDirection: 'row',
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  upgradeInputButtonText: {
    color: '#fff',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    marginLeft: 8,
  },

  userMessage: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  userMessageText: { color: 'white' },
  userMessageWrapper: { justifyContent: 'flex-end' },
  userTimestamp: { color: 'rgba(255, 255, 255, 0.7)' },
});
