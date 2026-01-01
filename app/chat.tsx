import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
  Keyboard,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { isUuid } from '../lib/chat';
import { Animated } from 'react-native';
import { ChatMenuPopup } from '../components/ChatMenuPopup';
import * as ImagePicker from 'expo-image-picker';
import { MindfulMessageModal } from '../components/MindfulMessageModal';
import { HarmfulMessageModal } from '../components/HarmfulMessageModal';
import { theme } from '../constants/theme';
import { analyzeMessage, isMindfulMessagingEnabled } from '../lib/ai/mindfulMessaging';

const FALLBACK_IMAGE = 'https://via.placeholder.com/400x400/EB1E66/FFFFFF?text=No+Image';

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
  const insets = useSafeAreaInsets();
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const subscriptionRef = useRef<Subscription | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const conversationId = String(id);

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

  // Load conversation and messages when component mounts
  useEffect(() => {
    const loadConversation = async () => {
      if (!currentUser?.id || !conversationId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch conversation details
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

        // Get the other user's info
        const otherUser =
          conversation.user1_id === currentUser.id ? conversation.user2 : conversation.user1;

        setChatPartner({
          id: otherUser?.id || '',
          name: otherUser?.nickname || 'Unknown',
          profileImage: otherUser?.photos?.[0] || '',
        });

        // Load messages
        const { data: messagesData, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (msgError) {
          console.error('Error loading messages:', msgError);
        } else {
          setMessages(messagesData || []);
        }
      } catch (error) {
        console.error('Error in loadConversation:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, currentUser]);

  // Set up real-time subscription for new messages and typing indicators
  useEffect(() => {
    if (!chatPartner || !currentUser) return;

    // Create a channel for real-time messages and presence
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
          const newMessage = payload.new;

          // Check if this is a message from the other user and mindful messaging is enabled
          if (newMessage.sender_id !== currentUser.id) {
            const isEnabled = await isMindfulMessagingEnabled();

            if (isEnabled) {
              // Analyze the received message for harmful content
              const analysis = await analyzeMessage(newMessage.content || '');

              if (analysis.needsReview) {
                // Store the harmful message details and show confirmation modal
                setHarmfulMessageContent(newMessage.content || '');
                setHarmfulMessageAnalysis(analysis as AnalysisResult);
                setHarmfulMessageModalVisible(true);
                return; // Don't add the message to the list yet
              }
            }
          }

          // Add the new message to the list
          setMessages((current) => [...current, newMessage]);
          // Hide typing indicator when message is received
          setOtherUserTyping(false);
          // Scroll to bottom when new message arrives
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);

          // Send notification if message is from other user
          if (newMessage.sender_id !== currentUser.id && chatPartner) {
            const { notificationService } = await import('../lib/notifications');
            await notificationService.sendMessageNotification(
              chatPartner.name,
              newMessage.content || '',
              conversationId
            );
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Check if other user is typing
        const otherUsers = Object.values(state).flat() as { user_id: string; typing: boolean }[];
        const isOtherTyping = otherUsers.some(
          (user) => user.user_id !== currentUser.id && user.typing === true
        );
        setOtherUserTyping(isOtherTyping);
      })
      .on(
        'presence',
        { event: 'join' },
        ({ key: _key, newPresences: _newPresences }: { key: string; newPresences: unknown[] }) => {
          // Handle user joining
        }
      )
      .on(
        'presence',
        { event: 'leave' },
        ({
          key: _key,
          leftPresences: _leftPresences,
        }: {
          key: string;
          leftPresences: unknown[];
        }) => {
          // Handle user leaving
          setOtherUserTyping(false);
        }
      )
      .subscribe(async (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED') => {
        if (status === 'SUBSCRIBED') {
          // Track user presence
          await channel.track({
            user_id: currentUser.id,
            typing: false,
          });
        }
      });

    // Store subscription reference for cleanup
    subscriptionRef.current = channel;

    // Cleanup function
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [chatPartner, currentUser, conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages]);

  // Early return if chat partner not found (after all hooks)
  if (!chatPartner && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Chat not found</Text>
      </SafeAreaView>
    );
  }

  // Analyze message before sending
  const analyzeThenSend = async () => {
    if (!newMessage.trim() || !currentUser || !chatPartner) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately for instant feedback

    try {
      // Check if mindful messaging is enabled
      const isEnabled = await isMindfulMessagingEnabled();

      if (!isEnabled) {
        // Feature disabled, send directly
        console.log('[Chat] Mindful messaging disabled, sending directly');
        await actualSendMessage(messageText);
        return;
      }

      // Analyze the message with mindful messaging
      console.log('[Chat] Analyzing message with mindful messaging...');
      const analysis = await analyzeMessage(messageText);

      if (analysis.needsReview) {
        // Show warning modal - restore message to input for editing
        console.log('[Chat] Message needs review, showing modal');
        setNewMessage(messageText); // Restore for editing
        setPendingMessage(messageText);
        setAnalysisResult(analysis as AnalysisResult);
        setMindfulModalVisible(true);
      } else {
        // Message is fine, send it
        console.log('[Chat] Message passed analysis, sending');
        await actualSendMessage(messageText);
      }
    } catch (error) {
      console.error('[Chat] Error analyzing message:', error);
      // If analysis fails, send the message anyway
      await actualSendMessage(messageText);
    }
  };

  // Actually send the message (bypassing analysis)
  const actualSendMessage = async (messageText: string) => {
    if (!currentUser || !chatPartner) return;

    // Optimistically add the message to the UI
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: String(id),
      sender_id: currentUser.id,
      content: messageText,
      created_at: new Date().toISOString(),
      sending: true, // Mark as sending
    };

    setMessages((current) => [...current, optimisticMessage]);

    // Only save to database if we have a valid UUID conversation
    if (!isUuid(String(id))) {
      // For demo chats, just update the local state
      setMessages((current) =>
        current.map((msg) => (msg.id === optimisticMessage.id ? { ...msg, sending: false } : msg))
      );
      return;
    }

    try {
      // Insert the message into the database
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
        // Remove the optimistic message on error
        setMessages((current) => current.filter((m) => m.id !== optimisticMessage.id));
        return;
      }

      // Replace the optimistic message with the real one
      if (data) {
        setMessages((current) => current.map((m) => (m.id === optimisticMessage.id ? data : m)));
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      // Remove the optimistic message on error
      setMessages((current) => current.filter((m) => m.id !== optimisticMessage.id));
    }
  };

  // Handle modal actions
  const handleEditMessage = () => {
    setMindfulModalVisible(false);
    // Restore the message to the input for editing
    setNewMessage(pendingMessage);
    setPendingMessage('');
    setAnalysisResult(null);
  };

  const handleSendAnyway = async () => {
    setMindfulModalVisible(false);
    await actualSendMessage(pendingMessage);
    setPendingMessage('');
    setAnalysisResult(null);
  };

  const handleCancelMessage = () => {
    setMindfulModalVisible(false);
    setPendingMessage('');
    setAnalysisResult(null);
  };

  const handleViewHarmfulAnyway = () => {
    // Add the harmful message to the list
    const harmfulMessage = {
      id: `harmful-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: chatPartner?.id || '',
      content: harmfulMessageContent,
      created_at: new Date().toISOString(),
    };
    setMessages((current) => [...current, harmfulMessage]);

    // Close the modal and reset state
    setHarmfulMessageModalVisible(false);
    setHarmfulMessageContent('');
    setHarmfulMessageAnalysis(null);
  };

  const handleKeepHidden = () => {
    // Just close the modal and reset state
    setHarmfulMessageModalVisible(false);
    setHarmfulMessageContent('');
    setHarmfulMessageAnalysis(null);
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
  };

  // Handle attachment button press
  const handleAttachPress = () => {
    // Show action sheet for both platforms using Alert
    Alert.alert(
      'Add Attachment',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
      ],
      { cancelable: true }
    );
  };

  // Take a photo with camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera access to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleImageSelected(result.assets[0].uri);
    }
  };

  // Pick image from library
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleImageSelected(result.assets[0].uri);
    }
  };

  // Handle selected image
  const handleImageSelected = async (_imageUri: string) => {
    Alert.alert(
      'Image Selected',
      'Image upload functionality will be implemented with backend storage.',
      [{ text: 'OK' }]
    );
  };

  // Handle typing indicator
  const handleTyping = async () => {
    if (!subscriptionRef.current || !currentUser) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      await subscriptionRef.current?.track?.({
        user_id: currentUser.id || '',
        typing: true,
      });
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      await subscriptionRef.current?.track?.({
        user_id: currentUser.id || '',
        typing: false,
      });
    }, 2000);
  };

  // Calculate bottom padding based on keyboard state
  const inputBottomPadding =
    Platform.OS === 'ios' ? (keyboardHeight > 0 ? 8 : Math.max(insets.bottom, 8)) : 8;

  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Messages Container */}
      <View style={styles.messagesContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          contentContainerStyle={[
            messages.length === 0 && !loading
              ? styles.messagesContentEmpty
              : styles.messagesContent,
            { paddingBottom: keyboardHeight > 0 ? 20 : 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            // Skeleton loader for messages
            <>
              {[1, 2, 3, 4, 5].map((index) => (
                <View
                  key={`skeleton-${index}`}
                  style={[styles.messageRow, index % 2 === 0 && styles.messageRowRight]}
                >
                  {index % 2 !== 0 && (
                    <View style={[styles.messageAvatar, styles.skeletonAvatar]} />
                  )}
                  <View
                    style={[
                      index % 2 === 0 ? styles.currentUserMessage : styles.otherUserMessage,
                      styles.skeletonMessage,
                      styles.skeletonMessageRandom,
                      { width: `${60 + Math.random() * 20}%` },
                    ]}
                  >
                    <View style={styles.skeletonText} />
                    <View style={styles.skeletonMessageSecondLine} />
                  </View>
                </View>
              ))}
            </>
          ) : messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>Start the conversation!</Text>
              <Text style={styles.emptyStateSubtext}>Say hello and break the ice 👋</Text>
            </View>
          ) : (
            messages.map((message) => {
              const isCurrentUser = message.sender_id === currentUser?.id;
              return (
                <View
                  key={message.id}
                  style={[styles.messageRow, isCurrentUser && styles.messageRowRight]}
                >
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
                      <Text style={styles.otherUserMessageText}>
                        {message.content ?? message.text ?? ''}
                      </Text>
                      <Text style={styles.messageTime}>
                        {formatMessageTime(message.created_at || message.createdAt || '')}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}

          {/* Typing Indicator */}
          {otherUserTyping && (
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
          )}
        </ScrollView>

        {/* Input Bar */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <View style={[styles.inputBar, { paddingBottom: inputBottomPadding }]}>
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFillObject} />
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.attachButton} onPress={handleAttachPress}>
                <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
              </TouchableOpacity>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={newMessage}
                  onChangeText={(text) => {
                    setNewMessage(text);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  placeholderTextColor="#999"
                  multiline
                  maxLength={1000}
                  contextMenuHidden={true}
                />
              </View>

              <TouchableOpacity
                style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
                onPress={analyzeThenSend}
                disabled={!newMessage.trim()}
              >
                <Ionicons
                  name="send"
                  size={24}
                  color={newMessage.trim() ? theme.colors.primary : '#ccc'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Chat menu */}
      <ChatMenuPopup
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        matchName={chatPartner?.name || 'Unknown'}
        matchPhoto={chatPartner?.profileImage || ''}
        isActive={false}
        messageCount={messages.length}
        onShareProfile={() => {
          setMenuVisible(false);
          Alert.alert('Share', "Profile sharing isn't configured yet.");
        }}
        onToggleReady={() => {
          // Hook into match state when backend is ready
        }}
        onGardenerAI={() => {
          setMenuVisible(false);
          router.push('/gardener');
        }}
        onReportProfile={() => {
          setMenuVisible(false);
          Alert.alert('Report', 'Thanks for the report. We will review.');
        }}
        onUnmatch={() => {
          setMenuVisible(false);
          Alert.alert('Unmatch', 'Unmatch logic will be implemented with matches table.');
        }}
      />

      {/* Mindful Messaging Modal */}
      {analysisResult && (
        <MindfulMessageModal
          visible={mindfulModalVisible}
          onClose={handleCancelMessage}
          onEdit={handleEditMessage}
          onSendAnyway={handleSendAnyway}
          reason={analysisResult.reason || ''}
          growthLesson={analysisResult.growthLesson || ''}
          severity={analysisResult.severity || 'low'}
        />
      )}

      {/* Harmful Message Modal */}
      {harmfulMessageAnalysis && (
        <HarmfulMessageModal
          visible={harmfulMessageModalVisible}
          onClose={handleKeepHidden}
          onViewAnyway={handleViewHarmfulAnyway}
          reason={harmfulMessageAnalysis.reason || ''}
          growthLesson={harmfulMessageAnalysis.growthLesson || ''}
          severity={harmfulMessageAnalysis.severity || 'low'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  attachButton: {
    marginBottom: 2,
    marginRight: 12,
  },
  backButton: {
    marginRight: 12,
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  currentUserMessage: {
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  currentUserMessageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    width: '100%',
  },
  emptyStateSubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  emptyStateText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  errorText: {
    color: '#666',
    fontSize: 18,
    marginTop: 50,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerAvatar: {
    borderRadius: 20,
    height: 40,
    marginRight: 12,
    width: 40,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  headerGradient: {
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  headerStatus: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  input: {
    color: '#333',
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    position: 'relative',
  },
  inputContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    elevation: 2,
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  messageAvatar: {
    borderRadius: 16,
    height: 32,
    marginRight: 8,
    width: 32,
  },
  messageRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginBottom: 16,
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageTime: {
    color: 'rgba(0, 0, 0, 0.5)',
    flexShrink: 0,
    fontSize: 12,
    marginTop: 4,
    minWidth: 60,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  messagesContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  messagesList: {
    flex: 1,
  },
  moreButton: {
    marginLeft: 12,
  },
  otherUserMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  otherUserMessageText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 20,
  },
  sendButton: {
    marginLeft: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  skeletonAvatar: {
    backgroundColor: '#e0e0e0',
  },
  skeletonMessage: {
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  skeletonMessageRandom: {
    width: '70%',
  },
  skeletonMessageSecondLine: {
    marginTop: 8,
    width: '40%',
  },
  skeletonText: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    height: 14,
    width: '80%',
  },
  typingDot: {
    backgroundColor: '#666',
    borderRadius: 4,
    height: 8,
    marginHorizontal: 2,
    width: 8,
  },
  typingDotFirst: {
    opacity: 0.4,
  },
  typingDotSecond: {
    opacity: 0.7,
  },
  typingDotThird: {
    opacity: 1,
  },
  typingDots: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  typingIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingIndicatorRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginBottom: 16,
  },
});
