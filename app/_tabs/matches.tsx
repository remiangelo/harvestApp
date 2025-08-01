import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlassView } from '../../components/liquid/LiquidGlassView';
import { router } from 'expo-router';
import { demoChats, getUnreadChatCount } from '../../data/demoChats';
import { format } from 'date-fns';

const recentMatches = [
  { id: '1', name: 'Maya', photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face', likes: 32 },
  { id: '2', name: 'Sophie', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face', likes: 0 },
  { id: '3', name: 'Elena', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', likes: 0 },
  { id: '4', name: 'Aria', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face', likes: 0 },
];

export default function MatchesScreen() {
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else {
      return format(date, 'MMM d');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with gradient background */}
      <LinearGradient colors={['#A0354E', '#8B1E2D']} style={styles.headerGradient}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Matches</Text>
            <View style={styles.headerRight}>
              {getUnreadChatCount() > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{getUnreadChatCount()}</Text>
                </View>
              )}
            </View>
          </View>
        </SafeAreaView>

        {/* Recent Matches */}
        <View style={styles.recentMatchesContainer}>
          <Text style={styles.sectionTitle}>Recent Matches</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.matchesScroll}
          >
            {recentMatches.map((match) => (
              <TouchableOpacity key={match.id} style={styles.matchItem}>
                <View style={styles.matchImageContainer}>
                  <Image source={{ uri: match.photo }} style={styles.matchImage} />
                  {match.likes > 0 && (
                    <View style={styles.likeBadge}>
                      <Ionicons name="heart" size={16} color="white" />
                      <Text style={styles.likeCount}>{match.likes}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.matchName}>{match.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      {/* Conversations List with Liquid Glass */}
      <LiquidGlassView
        intensity={85}
        tint="light"
        style={styles.conversationsContainer}
        borderRadius={24}
        glassTint="rgba(255, 255, 255, 0.95)"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {demoChats.map((chat, index) => (
            <TouchableOpacity
              key={chat.id}
              style={[
                styles.conversationItem,
                index === demoChats.length - 1 && styles.lastItem,
              ]}
              onPress={() => router.push(`/chat?id=${chat.id}` as any)}
            >
              <View style={styles.avatarContainer}>
                <Image source={{ uri: chat.profileImage }} style={styles.avatar} />
                {chat.isOnline && <View style={styles.onlineDot} />}
              </View>

              <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                  <Text style={styles.conversationName}>{chat.name}</Text>
                  <Text style={styles.timestamp}>{formatMessageTime(chat.lastMessageTime)}</Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>
              </View>

              <View style={styles.conversationMeta}>
                {chat.unreadCount > 0 && (
                  <View style={styles.unreadCountBadge}>
                    <Text style={styles.unreadCountText}>{chat.unreadCount}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#999" style={{ marginLeft: 8 }} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LiquidGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  avatarContainer: {
    marginRight: 12,
    position: 'relative',
  },
  container: {
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationItem: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 15,
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationName: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  conversationsContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  headerRight: {
    width: 28,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  lastMessage: {
    color: '#666',
    fontSize: 14,
  },
  likeBadge: {
    alignItems: 'center',
    backgroundColor: '#FF3B5C',
    borderRadius: 12,
    bottom: -5,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 2,
    position: 'absolute',
    right: -5,
  },
  likeCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  matchImage: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 35,
    borderWidth: 3,
    height: 70,
    width: 70,
  },
  matchImageContainer: {
    position: 'relative',
  },
  matchItem: {
    marginRight: 15,
    alignItems: 'center',
  },
  matchName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  matchesScroll: {
    paddingRight: 20,
  },
  onlineDot: {
    backgroundColor: '#34C759',
    borderColor: 'white',
    borderRadius: 6,
    borderWidth: 2,
    bottom: 2,
    height: 12,
    position: 'absolute',
    right: 2,
    width: 12,
  },
  recentMatchesContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
  },
  unreadBadge: {
    backgroundColor: '#FF3B5C',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  unreadCountBadge: {
    backgroundColor: '#A0354E',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadCountText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
