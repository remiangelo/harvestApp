import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Keyboard,
  FlatList,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { isUuid } from '../lib/chat';
import { ChatMenuPopup } from '../components/ChatMenuPopup';
import * as ImagePicker from 'expo-image-picker';
import { MindfulMessageModal } from '../components/MindfulMessageModal';
import { HarmfulMessageModal } from '../components/HarmfulMessageModal';
import { theme } from '../constants/theme';
import { analyzeMessage, isMindfulMessagingEnabled } from '../lib/ai/mindfulMessaging';
import { ChatInputBar, CHAT_INPUT_BAR_BASE_HEIGHT } from '../components/chat';

// ✅ Match GardenerChat behavior
import { useKeyboard } from '../hooks/useKeyboard';
import { useKeyboardSafeArea } from '../hooks/useKeyboardSafeArea';

// 🚫 Removed: useBottomTabBarHeight (causes crash when not inside tab navigator)

const FALLBACK_IMAGE = 'https://via.placeholder.com/400x400/EB1E66/FFFFFF?text=No+Image';
const TAB_BAR_HEIGHT = 70; // fallback only if you ever decide to treat this screen as tabbed

interface ChatPartner {
  id: string;
  name: string;
  profileImage: string;
}

interface Message {
  id: string;
  text?: string;
  content?: string;
  senderId?: string;
  sender_id?: string;
  createdAt?: string;
  created_at?: string;
  conversation_id?: string;
  sending?: boolean;
  [key: string]: unknown;
}

interface AnalysisResult {
  reason?: string;
  growthLesson?: string;
  severity?: 'low' | 'medium' | 'high';
  needsReview?: boolean;
  [key: string]: unknown;
}

interface Subscription {
  track?: (data: { user_id: string; typing: boolean }) => void;
  unsubscribe?: () => void;
  [key: string]: unknown;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const { currentUser } = useUser();

  // ✅ This screen is a Stack screen in your root layout, so it is NOT in the tab navigator.
  // This prevents the "Couldn't find the bottom tab bar height" crash.
  const hasTabBar = false;

  const { isKeyboardVisible } = useKeyboard({ hasTabBar });
  const { keyboardBehavior, getKeyboardVerticalOffset } = useKeyboardSafeArea({ hasTabBar });

  const [inputBarHeight, setInputBarHeight] = useState(CHAT_INPUT_BAR_BASE_HEIGHT);

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [mindfulModalVisible, setMindfulModalVisible] = useState(false);
  const [pendingMessage, setPendingMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [harmfulMessageModalVisible, setHarmfulMessageModalVisible] = useState(false);
  const [harmfulMessageAnalysis, setHarmfulMessageAnalysis] = useState<AnalysisResult | null>(null);
  const [harmfulMessageContent, setHarmfulMessageContent] = useState('');
  const [chatPartner, setChatPartner] = useState<ChatPartner | null>(null);

  const flatListRef = useRef<FlatList<Message>>(null);
  const subscriptionRef = useRef<Subscription | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conversationId = String(id);

  // ✅ reliable bottom scroll (same approach as updated GardenerChat)
  const scrollToBottom = useCallback((animated = false) => {
    flatListRef.current?.scrollToEnd({ animated });
  }, []);

  // ✅ Match GardenerChat padding behavior (messages never sit under input; tab bar only if you ever enable it)
  const listContentPaddingBottom = useMemo(() => {
    const tabBarPadding = hasTabBar && !isKeyboardVisible ? TAB_BAR_HEIGHT : 0;
    return inputBarHeight + tabBarPadding + 16;
  }, [inputBarHeight, hasTabBar, isKeyboardVisible]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!currentUser?.id || !conversationId) {
        setLoading(false);
        return;
      }

      try {
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select(
            `
            id,
            user1_id,
            user2_id,
            user1:users!user1_id (id, nickname, photos),
            user2:users!user2_id (id, nickname, photos)
          `
          )
          .eq('id', conversationId)
          .maybeSingle();

        if (convError || !conversation) {
          console.error('Error fetching conversation:', convError);
          setLoading(false);
          return;
        }

        const otherUser =
          conversation.user1_id === currentUser.id ? conversation.user2 : conversation.user1;

        setChatPartner({
          id: otherUser?.id || '',
          name: otherUser?.nickname || 'Unknown',
          profileImage: otherUser?.photos?.[0] || '',
        });

        const { data: messagesData, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (msgError) console.error('Error loading messages:', msgError);
        else setMessages(messagesData || []);
      } catch (error) {
        console.error('Error in loadConversation:', error);
      } finally {
        setLoading(false);
        // start at bottom once loaded
        scrollToBottom(false);
      }
    };

    loadConversation();
  }, [conversationId, currentUser, scrollToBottom]);

  useEffect(() => {
    if (!chatPartner || !currentUser) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: { new: Message }) => {
          const incoming = payload.new;

          if (incoming.sender_id !== currentUser.id) {
            const isEnabled = await isMindfulMessagingEnabled();
            if (isEnabled) {
              const analysis = await analyzeMessage(incoming.content || '');
              if (analysis.needsReview) {
                setHarmfulMessageContent(incoming.content || '');
                setHarmfulMessageAnalysis(analysis as AnalysisResult);
                setHarmfulMessageModalVisible(true);
                return;
              }
            }
          }

          setMessages((current) => [...current, incoming]);
          setOtherUserTyping(false);

          // keep at bottom for new messages (existing behavior)
          scrollToBottom(true);

          if (incoming.sender_id !== currentUser.id && chatPartner) {
            const { notificationService } = await import('../lib/notifications');
            await notificationService.sendMessageNotification(
              chatPartner.name,
              incoming.content || '',
              conversationId
            );
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const otherUsers = Object.values(state).flat() as { user_id: string; typing: boolean }[];
        const isOtherTyping = otherUsers.some(
          (u) => u.user_id !== currentUser.id && u.typing === true
        );
        setOtherUserTyping(isOtherTyping);
      })
      .on('presence', { event: 'leave' }, () => setOtherUserTyping(false))
      .subscribe(async (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED') => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: currentUser.id, typing: false });
        }
      });

    subscriptionRef.current = channel;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [chatPartner, currentUser, conversationId, scrollToBottom]);

  if (!chatPartner && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Chat not found</Text>
      </SafeAreaView>
    );
  }

  const analyzeThenSend = async () => {
    if (!newMessage.trim() || !currentUser || !chatPartner) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    Keyboard.dismiss();

    try {
      const isEnabled = await isMindfulMessagingEnabled();
      if (!isEnabled) {
        await actualSendMessage(messageText);
        return;
      }

      const analysis = await analyzeMessage(messageText);
      if (analysis.needsReview) {
        setNewMessage(messageText);
        setPendingMessage(messageText);
        setAnalysisResult(analysis as AnalysisResult);
        setMindfulModalVisible(true);
      } else {
        await actualSendMessage(messageText);
      }
    } catch (error) {
      console.error('[Chat] Error analyzing message:', error);
      await actualSendMessage(messageText);
    }
  };

  const actualSendMessage = async (messageText: string) => {
    if (!currentUser || !chatPartner) return;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: String(id),
      sender_id: currentUser.id,
      content: messageText,
      created_at: new Date().toISOString(),
      sending: true,
    };

    setMessages((current) => [...current, optimisticMessage]);
    scrollToBottom(true);

    if (!isUuid(String(id))) {
      setMessages((current) =>
        current.map((msg) => (msg.id === optimisticMessage.id ? { ...msg, sending: false } : msg))
      );
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: String(id),
            sender_id: currentUser.id,
            content: messageText,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error sending message:', error);
        setMessages((current) => current.filter((m) => m.id !== optimisticMessage.id));
        return;
      }

      if (data) {
        setMessages((current) => current.map((m) => (m.id === optimisticMessage.id ? data : m)));
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      setMessages((current) => current.filter((m) => m.id !== optimisticMessage.id));
    }
  };

  const handleAttachPress = () => {
    Alert.alert(
      'Add Attachment',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => {} },
        { text: 'Choose from Library', onPress: () => {} },
      ],
      { cancelable: true }
    );
  };

  const handleTyping = async () => {
    if (!subscriptionRef.current || !currentUser) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (!isTyping) {
      setIsTyping(true);
      await subscriptionRef.current?.track?.({ user_id: currentUser.id || '', typing: true });
    }

    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      await subscriptionRef.current?.track?.({ user_id: currentUser.id || '', typing: false });
    }, 2000);
  };

  const formatMessageTime = (timestamp: string) => format(new Date(timestamp), 'h:mm a');

  const renderMessage = ({ item: message }: { item: Message }) => {
    const isCurrentUser = message.sender_id === currentUser?.id;
    return (
      <View style={[styles.messageRow, isCurrentUser && styles.messageRowRight]}>
        {!isCurrentUser && (
          <Image
            source={{ uri: chatPartner?.profileImage || FALLBACK_IMAGE }}
            style={styles.messageAvatar}
          />
        )}

        {isCurrentUser ? (
          <View style={styles.currentUserMessage}>
            <Text style={styles.currentUserMessageText}>
              {message.content ?? message.text ?? ''}
            </Text>
            <Text style={styles.messageTime}>
              {formatMessageTime(message.created_at || message.createdAt || '')}
            </Text>
          </View>
        ) : (
          <View style={styles.otherUserMessage}>
            <Text style={styles.otherUserMessageText}>{message.content ?? message.text ?? ''}</Text>
            <Text style={styles.messageTime}>
              {formatMessageTime(message.created_at || message.createdAt || '')}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!otherUserTyping) return null;
    return (
      <View style={styles.typingIndicatorRow}>
        <Image
          source={{ uri: chatPartner?.profileImage || FALLBACK_IMAGE }}
          style={styles.messageAvatar}
        />
        <View style={styles.typingIndicator}>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.typingDot, styles.typingDotFirst]} />
            <Animated.View style={[styles.typingDot, styles.typingDotSecond]} />
            <Animated.View style={[styles.typingDot, styles.typingDotThird]} />
          </View>
        </View>
      </View>
    );
  };

  const ScreenBody = (
    <View style={styles.messagesContainer}>
      <FlatList
        ref={flatListRef}
        style={{ flex: 1 }}
        data={loading ? [] : messages} // oldest -> newest
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: listContentPaddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        // ✅ same as updated GardenerChat: scroll after layout/content settles
        onContentSizeChange={() => scrollToBottom(false)}
        ListFooterComponent={renderTypingIndicator()}
      />

      <ChatInputBar
        value={newMessage}
        onChangeText={(text) => {
          setNewMessage(text);
          handleTyping();
        }}
        onSend={analyzeThenSend}
        onAttach={handleAttachPress}
        placeholder="Type a message..."
        hasTabBar={hasTabBar}
        tabBarHeight={TAB_BAR_HEIGHT}
        showAttachButton={true}
        maxLength={1000}
        onHeightChange={setInputBarHeight}
        //absolute={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Image
                source={{ uri: chatPartner?.profileImage || FALLBACK_IMAGE }}
                style={styles.headerAvatar}
              />
              <View style={styles.headerInfo}>
                <Text style={styles.headerName}>{chatPartner?.name}</Text>
                <Text style={styles.headerStatus}>Offline</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.moreButton} onPress={() => setMenuVisible(true)}>
              <Ionicons name="ellipsis-vertical" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={keyboardBehavior}
          keyboardVerticalOffset={getKeyboardVerticalOffset(0)}
        >
          {ScreenBody}
        </KeyboardAvoidingView>
      ) : (
        ScreenBody
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: { marginRight: 12 },
  container: { backgroundColor: '#f5f5f5', flex: 1 },
  currentUserMessage: {
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  currentUserMessageText: { color: 'white', fontSize: 16, lineHeight: 20 },
  errorText: { color: '#666', fontSize: 18, marginTop: 50, textAlign: 'center' },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerAvatar: { borderRadius: 20, height: 40, marginRight: 12, width: 40 },
  headerCenter: { alignItems: 'center', flex: 1, flexDirection: 'row' },
  headerGradient: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerInfo: { flex: 1 },
  headerName: { color: 'white', fontSize: 18, fontWeight: '600' },
  headerStatus: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 14 },
  messageAvatar: { borderRadius: 16, height: 32, marginRight: 8, width: 32 },
  messageRow: { alignItems: 'flex-end', flexDirection: 'row', marginBottom: 16 },
  messageRowRight: { justifyContent: 'flex-end' },
  messageTime: {
    color: 'rgba(0, 0, 0, 0.5)',
    flexShrink: 0,
    fontSize: 12,
    marginTop: 4,
    minWidth: 60,
  },
  messagesContainer: { flex: 1 },
  messagesContent: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 20 },
  moreButton: { marginLeft: 12 },
  otherUserMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  otherUserMessageText: { color: '#333', fontSize: 16, lineHeight: 20 },

  typingDot: { backgroundColor: '#666', borderRadius: 4, height: 8, marginHorizontal: 2, width: 8 },
  typingDotFirst: { opacity: 0.4 },
  typingDotSecond: { opacity: 0.7 },
  typingDotThird: { opacity: 1 },
  typingDots: { alignItems: 'center', flexDirection: 'row' },
  typingIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingIndicatorRow: { alignItems: 'flex-end', flexDirection: 'row', marginBottom: 16 },
});
