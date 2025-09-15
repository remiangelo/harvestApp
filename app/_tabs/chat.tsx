import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  Animated,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlassView } from '../../components/liquid/LiquidGlassView';
import { router } from 'expo-router';
import { demoChats } from '../../data/demoChats';
import { format } from 'date-fns';
import { theme } from '../../constants/theme';

export default function ChatTabScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chatsLoading, setChatsLoading] = useState(true);
  const [conversations] = useState(demoChats);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simulate loading and animate content
    const timer = setTimeout(() => {
      setChatsLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }, 500);

    return () => clearTimeout(timer);
  }, [fadeAnim]);

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 168) {
      return format(date, 'EEEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  const filteredChats = conversations.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with gradient background */}
      <LinearGradient colors={['#A0354E', '#8B1E2D', '#701625']} style={styles.headerGradient}>
        <SafeAreaView>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Messages</Text>
            {totalUnread > 0 && (
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>{totalUnread > 99 ? '99+' : totalUnread}</Text>
              </View>
            )}
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <LiquidGlassView
              intensity={60}
              tint="light"
              style={styles.searchBar}
              borderRadius={25}
              glassTint="rgba(255, 255, 255, 0.95)"
            >
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search conversations..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </LiquidGlassView>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Conversations List */}
      <ScrollView
        style={styles.conversationsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {chatsLoading ? (
          // Skeleton loader for chats
          <>
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <LiquidGlassView
                key={`skeleton-${index}`}
                intensity={50}
                tint="light"
                style={styles.conversationCard}
                borderRadius={16}
                glassTint="rgba(255, 255, 255, 0.9)"
              >
                <View style={styles.conversationItem}>
                  <View style={[styles.avatar, styles.skeletonAvatar]} />
                  <View style={styles.conversationContent}>
                    <View style={[styles.skeletonText, styles.skeletonTextTitle]} />
                    <View style={[styles.skeletonText, styles.skeletonTextMessage]} />
                  </View>
                </View>
              </LiquidGlassView>
            ))}
          </>
        ) : filteredChats.length === 0 ? (
          <View style={styles.emptyState}>
            <LiquidGlassView
              intensity={70}
              tint="light"
              style={styles.emptyStateCard}
              borderRadius={20}
              glassTint="rgba(255, 255, 255, 0.95)"
            >
              <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>
                {searchQuery ? 'No conversations found' : 'No messages yet'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'When you match with someone, your conversations will appear here'}
              </Text>
            </LiquidGlassView>
          </View>
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
            {filteredChats.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                onPress={() => router.push(`/chat?id=${chat.id}`)}
                activeOpacity={0.7}
              >
                <LiquidGlassView
                  intensity={60}
                  tint="light"
                  style={styles.conversationCard}
                  borderRadius={16}
                  glassTint="rgba(255, 255, 255, 0.92)"
                >
                  <View style={styles.conversationItem}>
                    <View style={styles.avatarContainer}>
                      <Image source={{ uri: chat.profileImage }} style={styles.avatar} />
                      {chat.isOnline && <View style={styles.onlineDot} />}
                    </View>

                    <View style={styles.conversationContent}>
                      <View style={styles.conversationHeader}>
                        <Text style={styles.conversationName} numberOfLines={1}>
                          {chat.name}
                        </Text>
                        <Text style={styles.timestamp}>
                          {formatMessageTime(chat.lastMessageTime)}
                        </Text>
                      </View>
                      <View style={styles.messageRow}>
                        <Text style={styles.lastMessage} numberOfLines={2}>
                          {chat.lastMessage}
                        </Text>
                        {chat.unreadCount > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>
                              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#ccc"
                      style={styles.chevron}
                    />
                  </View>
                </LiquidGlassView>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 28,
    height: 56,
    width: 56,
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  chevron: {
    marginLeft: 8,
  },
  container: {
    backgroundColor: '#F8F8F8',
    flex: 1,
  },
  conversationCard: {
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 12,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  conversationItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  conversationName: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  conversationsContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyStateCard: {
    alignItems: 'center',
    padding: 40,
    width: '100%',
  },
  emptyStateSubtext: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyStateTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    position: 'relative',
  },
  headerBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    marginLeft: 8,
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  headerBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerGradient: {
    paddingBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  lastMessage: {
    color: '#666',
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  messageRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  onlineDot: {
    backgroundColor: '#34C759',
    borderColor: 'white',
    borderRadius: 7,
    borderWidth: 2,
    bottom: 2,
    height: 14,
    position: 'absolute',
    right: 2,
    width: 14,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 20,
  },
  searchBar: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    color: '#333',
    flex: 1,
    fontSize: 16,
  },
  skeletonAvatar: {
    backgroundColor: '#e0e0e0',
  },
  skeletonText: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  skeletonTextMessage: {
    height: 14,
    marginTop: 8,
    width: 200,
  },
  skeletonTextTitle: {
    height: 16,
    width: 120,
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
  },
  unreadBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    marginLeft: 8,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
