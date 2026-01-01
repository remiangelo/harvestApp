import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useGardenerStore } from '../../stores/useGardenerStore';
import { theme } from '../../constants/theme';
import { gardenerService } from '../../lib/ai/gardenerService';
import { gardenerChatService } from '../../lib/gardenerSupabase';
import { useAuthStore } from '../../stores/useAuthStore';
import useSubscriptionStore from '../../stores/useSubscriptionStore';
import { UpgradeModal } from '../UpgradeModal';
import { formatLimitMessage } from '../../lib/subscription';

import GARDENER_AVATAR from '../../assets/images/unnamed.png';

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
  const { chatHistory, addChatMessage, openAiApiKey } = useGardenerStore();
  const { user } = useAuthStore();
  const { tier, canUseGardener, incrementGardenerUsage, fetchSubscription, fetchUsage } =
    useSubscriptionStore();
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // Load subscription and usage data
  useEffect(() => {
    if (user?.id) {
      fetchSubscription(user.id);
      fetchUsage(user.id);
    }
  }, [user?.id]);

  // Track keyboard height
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Load chat history from database
  useEffect(() => {
    const loadChatHistory = async () => {
      if (user?.id) {
        setIsLoadingHistory(true);
        const dbHistory = await gardenerChatService.getChatHistory(user.id);

        if (dbHistory.length > 0) {
          const formattedHistory = dbHistory.map((msg) => ({
            id: msg.id || Date.now().toString(),
            text: msg.message,
            sender: msg.sender,
            timestamp: new Date(msg.created_at || Date.now()),
          }));
          setMessages(formattedHistory);
        } else if (chatHistory.length > 0) {
          // Fallback to local store if no DB history
          const formattedHistory = chatHistory.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          }));
          setMessages(formattedHistory);
        }
        setIsLoadingHistory(false);
      } else {
        // Use local store for test mode
        if (chatHistory.length > 0) {
          const formattedHistory = chatHistory.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          }));
          setMessages(formattedHistory);
        }
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [user?.id, chatHistory]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Check if user can use gardener based on their tier
    if (!canUseGardener()) {
      setLimitReached(true);
      // Show limit reached message
      const limitMessage = formatLimitMessage('gardener', tier, 0);
      const gardenerLimitMessage: Message = {
        id: Date.now().toString(),
        text: limitMessage,
        sender: 'gardener',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, gardenerLimitMessage]);
      setShowUpgradeModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    addChatMessage({ text: userMessage.text, sender: 'user' });
    setInputText('');
    setIsTyping(true);

    // Save to database if user is authenticated
    if (user?.id) {
      await gardenerChatService.saveMessage(user.id, userMessage.text, 'user');
    }

    try {
      // Increment gardener usage
      if (user?.id) {
        await incrementGardenerUsage(user.id);
      }

      // Get AI response
      const conversationHistory = messages.slice(-10).map((msg) => ({
        role: msg.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: msg.text,
      }));

      const response = await gardenerService.getChatResponse(userMessage.text, conversationHistory);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'gardener',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      addChatMessage({ text: aiMessage.text, sender: 'gardener' });

      // Save AI response to database
      if (user?.id) {
        await gardenerChatService.saveMessage(user.id, response, 'gardener');
      }

      // Check if user has hit their limit after this conversation
      if (!canUseGardener()) {
        setLimitReached(true);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (!dateObj || isNaN(dateObj.getTime())) {
        return '';
      }
      return dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return '';
    }
  };

  // Calculate bottom padding based on keyboard state and whether there's a tab bar
  const inputBottomPadding =
    Platform.OS === 'ios'
      ? keyboardHeight > 0
        ? 8
        : Math.max(insets.bottom, 8) + (onBack ? 0 : 70)
      : onBack
        ? 8
        : 78;

  return (
    <View style={styles.container}>
      {/* Upgrade Modal */}
      <UpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        highlightFeature="gardener"
        title="Unlock More Gardener Conversations"
        subtitle="Get unlimited AI dating advice with Gold"
      />

      {/* Header - Only show if onBack is provided */}
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

      {/* Chat Container */}
      <View style={styles.chatContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: keyboardHeight > 0 ? 20 : 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.sender === 'user'
                  ? styles.userMessageWrapper
                  : styles.gardenerMessageWrapper,
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
          ))}
          {isTyping && (
            <View style={[styles.messageWrapper, styles.gardenerMessageWrapper]}>
              <View style={styles.avatarContainer}>
                <Image source={GARDENER_AVATAR} style={styles.messageAvatar} />
              </View>
              <View style={[styles.messageBubble, styles.gardenerMessage, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#666" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <View style={[styles.inputBar, { paddingBottom: inputBottomPadding }]}>
            <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFillObject} />
            <View style={styles.inputWrapper}>
              {limitReached ? (
                <TouchableOpacity
                  style={styles.upgradeInputButton}
                  onPress={() => setShowUpgradeModal(true)}
                >
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.upgradeInputButtonText}>Upgrade to continue chatting</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <View style={styles.textInputContainer}>
                    <TextInput
                      style={styles.input}
                      value={inputText}
                      onChangeText={setInputText}
                      placeholder="Ask for dating advice..."
                      placeholderTextColor="#999"
                      multiline
                      maxLength={500}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={sendMessage}
                    disabled={!inputText.trim() || isTyping}
                    style={[
                      styles.sendButton,
                      (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
                    ]}
                  >
                    <Ionicons
                      name="send"
                      size={20}
                      color={!inputText.trim() || isTyping ? '#ccc' : theme.colors.primary}
                    />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 18,
    height: 36,
    width: 36,
  },
  avatarContainer: {
    marginRight: 8,
  },
  backButton: {
    marginRight: 8,
    padding: 8,
  },
  chatContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  gardenerMessage: {
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 4,
  },
  gardenerMessageText: {
    color: '#333',
  },
  gardenerMessageWrapper: {
    justifyContent: 'flex-start',
  },
  gardenerTimestamp: {
    color: '#999',
  },
  header: {
    paddingBottom: 10,
  },
  headerAvatar: {
    marginLeft: 12,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 5,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerSafe: {
    marginTop: 0,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  input: {
    color: '#333',
    flex: 1,
    fontSize: 15,
    maxHeight: 120,
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputBar: {
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    borderTopWidth: 0.5,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  inputWrapper: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  messageAvatar: {
    borderRadius: 16,
    height: 32,
    width: 32,
  },
  messageBubble: {
    borderRadius: 16,
    maxWidth: '75%',
    padding: 12,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  sendButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginLeft: 8,
    width: 40,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  textInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    elevation: 2,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  typingBubble: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
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
  userMessage: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  userMessageText: {
    color: 'white',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
