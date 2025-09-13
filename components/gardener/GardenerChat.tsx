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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useGardenerStore } from '../../stores/useGardenerStore';
import { gardenerService } from '../../lib/ai/gardenerService';
import { gardenerChatService } from '../../lib/gardenerSupabase';
import { useAuthStore } from '../../stores/useAuthStore';

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
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

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
          setMessages(chatHistory as Message[]);
        }
        setIsLoadingHistory(false);
      } else {
        // Use local store for test mode
        if (chatHistory.length > 0) {
          setMessages(chatHistory as Message[]);
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
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header - Only show if onBack is provided */}
      {onBack && (
        <LinearGradient colors={['#A0354E', '#8B1E2D', '#701625']} style={styles.header}>
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
                <LinearGradient colors={['#A0354E', '#8B1E2D']} style={styles.avatar}>
                  <Ionicons name="leaf" size={24} color="white" />
                </LinearGradient>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      )}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
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
                  <LinearGradient colors={['#A0354E', '#8B1E2D']} style={styles.avatar}>
                    <Ionicons name="leaf" size={20} color="white" />
                  </LinearGradient>
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
                <LinearGradient colors={['#A0354E', '#8B1E2D']} style={styles.avatar}>
                  <Ionicons name="leaf" size={20} color="white" />
                </LinearGradient>
              </View>
              <View style={[styles.messageBubble, styles.gardenerMessage, styles.typingBubble]}>
                <ActivityIndicator size="small" color="#666" />
              </View>
            </View>
          )}
        </ScrollView>

        <BlurView intensity={70} tint="light" style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask for dating advice..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
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
                color={!inputText.trim() || isTyping ? '#ccc' : '#A0354E'}
              />
            </TouchableOpacity>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    color: '#333',
    flex: 1,
    fontSize: 15,
    marginRight: 8,
    maxHeight: 120,
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputContainer: {
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    borderTopWidth: 0.5,
  },
  inputWrapper: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 20,
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
    paddingBottom: 20,
  },
  sendButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  typingBubble: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  userMessage: {
    backgroundColor: '#A0354E',
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
