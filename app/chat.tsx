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
import { getDemoChatById } from '../data/demoChats';
import { format } from 'date-fns';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const chat = getDemoChatById(id as string);
  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom when component mounts
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  if (!chat) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Chat not found</Text>
      </SafeAreaView>
    );
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'h:mm a');
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
              <Image source={{ uri: chat.profileImage }} style={styles.headerAvatar} />
              <View style={styles.headerInfo}>
                <Text style={styles.headerName}>{chat.name}</Text>
                <Text style={styles.headerStatus}>{chat.isOnline ? 'Active now' : 'Offline'}</Text>
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
          {chat.messages.map((message) => {
            const isCurrentUser = message.senderId === 'current-user';
            return (
              <View
                key={message.id}
                style={[styles.messageRow, isCurrentUser && styles.messageRowRight]}
              >
                {!isCurrentUser && (
                  <Image source={{ uri: chat.profileImage }} style={styles.messageAvatar} />
                )}

                {isCurrentUser ? (
                  <View style={styles.currentUserMessage}>
                    <Text style={styles.currentUserMessageText}>{message.text}</Text>
                    <Text style={styles.messageTime}>{formatMessageTime(message.timestamp)}</Text>
                  </View>
                ) : (
                  <View style={styles.otherUserMessage}>
                    <Text style={styles.otherUserMessageText}>{message.text}</Text>
                    <Text style={styles.messageTime}>{formatMessageTime(message.timestamp)}</Text>
                  </View>
                )}
              </View>
            );
          })}
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
            onChangeText={setNewMessage}
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
    marginBottom: 2,
    marginLeft: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
