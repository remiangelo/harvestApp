import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Input, Card, Avatar } from './ui';
import { theme } from '../constants/theme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'gardener';
  timestamp: Date;
}

interface GardenerChatProps {
  onClose?: () => void;
}

export const GardenerChat: React.FC<GardenerChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Gardener AI coach. I'm here to help you grow meaningful connections. What would you like to talk about today?",
      sender: 'gardener',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "That's a great question! Let me help you with that...",
        sender: 'gardener',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const renderMessage = (message: Message) => {
    const isGardener = message.sender === 'gardener';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isGardener ? styles.gardenerMessage : styles.userMessage,
        ]}
      >
        {isGardener && (
          <Avatar
            source={require('../assets/images/gardener-avatar.png')}
            size="small"
            style={styles.avatar}
          />
        )}
        <Card
          variant={isGardener ? 'outlined' : 'filled'}
          style={[
            styles.messageBubble,
            isGardener ? styles.gardenerBubble : styles.userBubble,
          ]}
        >
          <Text
            variant="body"
            color={isGardener ? 'primary' : 'inverse'}
            style={styles.messageText}
          >
            {message.text}
          </Text>
          <Text
            variant="caption"
            color={isGardener ? 'secondary' : 'inverse'}
            style={styles.timestamp}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Card>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar
            source={require('../assets/images/gardener-avatar.png')}
            size="medium"
            showBadge
            badgeColor={theme.colors.success}
          />
          <View style={styles.headerInfo}>
            <Text variant="h3" weight="bold">
              Gardener AI
            </Text>
            <Text variant="caption" color="secondary">
              Your Dating Coach • Always Here
            </Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(renderMessage)}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <Input
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything..."
          onSubmitEditing={sendMessage}
          style={styles.input}
          rightIcon={
            <TouchableOpacity onPress={sendMessage}>
              <Ionicons
                name="send"
                size={24}
                color={inputText.trim() ? theme.colors.primary : theme.colors.text.tertiary}
              />
            </TouchableOpacity>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    ...theme.shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerInfo: {
    marginLeft: theme.spacing.md,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  gardenerMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  avatar: {
    marginRight: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: theme.spacing.md,
  },
  gardenerBubble: {
    backgroundColor: theme.colors.background,
    marginLeft: 0,
  },
  userBubble: {
    backgroundColor: theme.colors.primary,
  },
  messageText: {
    marginBottom: theme.spacing.xs,
  },
  timestamp: {
    fontSize: 11,
  },
  inputContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  input: {
    marginBottom: 0,
  },
});