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
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { getDemoChatById, demoChats } from '../data/demoChats';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { ActivityIndicator, Animated } from 'react-native';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const { currentUser } = useUser();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const subscriptionRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Find the match for this chat
  const match = demoChats.find((c) => c.id === id);
  
  if (!match) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Chat not found</Text>
      </SafeAreaView>
    );
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  


  // Load messages when component mounts
  useEffect(() => {
    if (!match) return;

    const loadMessages = async () => {
      try {
        // First check if we have a conversations table entry
        const { data: conversation } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', match.id)
          .single();

        // If no conversation exists, create one (for demo purposes)
        if (!conversation) {
          // For now, just use demo messages
          const demoMessages = match.messages || [];
          setMessages(demoMessages.map((msg: any, index: number) => ({
            id: `demo-${index}`,
            conversation_id: match.id,
            sender_id: msg.isCurrentUser ? currentUser?.id : match.id,
            content: msg.text,
            created_at: msg.timestamp,
          })));
          setLoading(false);
          return;
        }

        // Load real messages from database
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', match.id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          // Fall back to demo messages
          const demoMessages = match.messages || [];
          setMessages(demoMessages.map((msg: any, index: number) => ({
            id: `demo-${index}`,
            conversation_id: match.id,
            sender_id: msg.isCurrentUser ? currentUser?.id : match.id,
            content: msg.text,
            created_at: msg.timestamp,
          })));
        } else {
          setMessages(data || []);
        }
      } catch (error) {
        console.error('Error in loadMessages:', error);
        // Fall back to demo messages
        const demoMessages = match.messages || [];
        setMessages(demoMessages.map((msg: any, index: number) => ({
          id: `demo-${index}`,
          conversation_id: match.id,
          sender_id: msg.isCurrentUser ? currentUser?.id : match.id,
          content: msg.text,
          created_at: msg.timestamp,
        })));
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [match, currentUser]);

  // Set up real-time subscription for new messages and typing indicators
  useEffect(() => {
    if (!match || !currentUser) return;

    // Create a channel for real-time messages and presence
    const channel = supabase
      .channel(`chat:${match.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${match.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as any;
          // Add the new message to the list
          setMessages((current) => [...current, newMessage]);
          // Hide typing indicator when message is received
          setOtherUserTyping(false);
          // Scroll to bottom when new message arrives
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
          
          // Send notification if message is from other user
          if (newMessage.sender_id !== currentUser.id) {
            const { notificationService } = await import('../lib/notifications');
            await notificationService.sendMessageNotification(
              match.name,
              newMessage.content,
              match.id
            );
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Check if other user is typing
        const otherUsers = Object.values(state).flat();
        const isOtherTyping = otherUsers.some(
          (user: any) => user.user_id !== currentUser.id && user.typing === true
        );
        setOtherUserTyping(isOtherTyping);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Handle user joining
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // Handle user leaving
        setOtherUserTyping(false);
      })
      .subscribe(async (status) => {
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
  }, [match, currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages]);


  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !match) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    // Optimistically add the message to the UI
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: match.id,
      sender_id: currentUser.id,
      content: messageText,
      created_at: new Date().toISOString(),
      sending: true, // Mark as sending
    };

    setMessages((current) => [...current, optimisticMessage]);

    try {
      // Insert the message into the database
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: match.id,
            sender_id: currentUser.id,
            content: messageText,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        // Remove the optimistic message on error
        setMessages((current) => current.filter((m) => m.id !== optimisticMessage.id));
        // Show error feedback (could add a toast here)
        return;
      }

      // Replace the optimistic message with the real one
      if (data) {
        setMessages((current) =>
          current.map((m) => (m.id === optimisticMessage.id ? data : m))
        );
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      // Remove the optimistic message on error
      setMessages((current) => current.filter((m) => m.id !== optimisticMessage.id));
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
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
      await subscriptionRef.current.track({
        user_id: currentUser.id,
        typing: true,
      });
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      await subscriptionRef.current.track({
        user_id: currentUser.id,
        typing: false,
      });
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#A0354E', '#8B1E2D']} style={styles.headerGradient}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Image source={{ uri: match.profileImage }} style={styles.headerAvatar} />
              <View style={styles.headerInfo}>
                <Text style={styles.headerName}>{match.name}</Text>
                <Text style={styles.headerStatus}>{match.isOnline ? 'Active now' : 'Offline'}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.moreButton}>
              <Ionicons name="ellipsis-vertical" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            // Skeleton loader for messages
            <>
              {[1, 2, 3, 4, 5].map((index) => (
                <View
                  key={`skeleton-${index}`}
                  style={[
                    styles.messageRow,
                    index % 2 === 0 && styles.messageRowRight,
                  ]}
                >
                  {index % 2 !== 0 && (
                    <View style={[styles.messageAvatar, styles.skeletonAvatar]} />
                  )}
                  <View
                    style={[
                      index % 2 === 0 ? styles.currentUserMessage : styles.otherUserMessage,
                      styles.skeletonMessage,
                      { width: `${60 + Math.random() * 20}%` },
                    ]}
                  >
                    <View style={styles.skeletonText} />
                    <View style={[styles.skeletonText, { width: '40%', marginTop: 8 }]} />
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
                    <Image source={{ uri: match.profileImage }} style={styles.messageAvatar} />
                  )}

                  {isCurrentUser ? (
                    <View style={styles.currentUserMessage}>
                      <Text style={styles.currentUserMessageText}>{message.content}</Text>
                      <Text style={styles.messageTime}>{formatMessageTime(message.created_at)}</Text>
                    </View>
                  ) : (
                    <View style={styles.otherUserMessage}>
                      <Text style={styles.otherUserMessageText}>{message.content}</Text>
                      <Text style={styles.messageTime}>{formatMessageTime(message.created_at)}</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
          
          {/* Typing Indicator */}
          {otherUserTyping && (
            <View style={styles.typingIndicatorRow}>
              <Image source={{ uri: match.profileImage }} style={styles.messageAvatar} />
              <View style={styles.typingIndicator}>
                <View style={styles.typingDots}>
                  <Animated.View style={[styles.typingDot, { opacity: 0.4 }]} />
                  <Animated.View style={[styles.typingDot, { opacity: 0.7 }]} />
                  <Animated.View style={[styles.typingDot, { opacity: 1 }]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFillObject} />
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle" size={28} color="#A0354E" />
          </TouchableOpacity>

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
          />

          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={24} color={newMessage.trim() ? '#A0354E' : '#ccc'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: '#A0354E',
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
    color: '#333',
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  inputBar: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
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
    fontSize: 12,
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
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
  skeletonText: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    height: 14,
    width: '80%',
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyStateText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  typingIndicatorRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginBottom: 16,
  },
  typingIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginHorizontal: 2,
  },
});

