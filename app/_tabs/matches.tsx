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
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlassView } from '../../components/liquid/LiquidGlassView';
import { router } from 'expo-router';
import { demoChats, getUnreadChatCount } from '../../data/demoChats';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../context/UserContext';

// Remove the hardcoded recentMatches array

export default function MatchesScreen() {
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatsLoading, setChatsLoading] = useState(true);
  const { currentUser } = useUser();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!currentUser) return;

    const fetchMatches = async () => {
      try {
        // Get matches for the current user
        const { data, error } = await supabase
          .from('matches')
          .select(
            `
            id,
            matched_at,
            user1_id,
            user2_id,
            user1:users!user1_id (
              id,
              nickname,
              avatar_url
            ),
            user2:users!user2_id (
              id,
              nickname,
              avatar_url
            )
          `
          )
          .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
          .order('matched_at', { ascending: false })
          .limit(4);

        if (error) {
          console.error('Error fetching matches:', error);
          return;
        }

        // Format matches data
        const formattedMatches = data.map((match: any) => {
          // Determine which profile is the other user
          const otherUser = match.user1_id === currentUser?.id ? match.user2 : match.user1;

          return {
            id: match.id,
            name: otherUser.nickname || 'Unknown',
            photo: otherUser.avatar_url,
            likes: 0, // This would come from a separate likes count query
          };
        });

        setRecentMatches(formattedMatches);
      } catch (error) {
        console.error('Error in fetchMatches:', error);
      } finally {
        setLoading(false);
        // Animate in content
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    };

    fetchMatches();
    // Simulate chat loading
    setTimeout(() => setChatsLoading(false), 1000);
  }, [currentUser, fadeAnim]);

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
            {loading ? (
              // Skeleton loader for matches
              <>
                {[1, 2, 3, 4].map((index) => (
                  <View key={`skeleton-match-${index}`} style={styles.matchItem}>
                    <View style={[styles.matchImageContainer, styles.skeletonImage]} />
                    <View style={[styles.skeletonText, { width: 60, height: 14, marginTop: 8 }]} />
                  </View>
                ))}
              </>
            ) : recentMatches.length > 0 ? (
              recentMatches.map((match) => (
                <Animated.View key={match.id} style={{ opacity: fadeAnim }}>
                  <TouchableOpacity style={styles.matchItem}>
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
                </Animated.View>
              ))
            ) : (
              <View style={styles.noMatchesContainer}>
                <Text style={styles.noMatchesText}>No matches yet</Text>
                <Text style={styles.noMatchesSubtext}>Keep swiping!</Text>
              </View>
            )}
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={(event) => {
            const y = event.nativeEvent.contentOffset.y;
            // Notify tab bar about scroll
            if ((global as any).handleTabBarScroll) {
              (global as any).handleTabBarScroll(y);
            }
          }}
          scrollEventThrottle={16}
        >
          {chatsLoading ? (
            // Skeleton loader for chats
            <>
              {[1, 2, 3, 4, 5].map((index) => (
                <View key={`skeleton-chat-${index}`} style={styles.conversationItem}>
                  <View style={[styles.avatar, styles.skeletonAvatar]} />
                  <View style={styles.conversationContent}>
                    <View style={[styles.skeletonText, { width: 120, height: 16 }]} />
                    <View style={[styles.skeletonText, { width: 200, height: 14, marginTop: 8 }]} />
                  </View>
                </View>
              ))}
            </>
          ) : (
            demoChats.map((chat, index) => (
              <TouchableOpacity
                key={chat.id}
                style={[styles.conversationItem, index === demoChats.length - 1 && styles.lastItem]}
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
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#999"
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    alignItems: 'center',
    flexDirection: 'row',
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
    alignItems: 'center',
    width: 28,
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
    alignItems: 'center',
    marginRight: 15,
  },
  matchName: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  matchesScroll: {
    paddingRight: 20,
  },
  noMatchesContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  noMatchesSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  noMatchesText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
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
  skeletonAvatar: {
    backgroundColor: '#e0e0e0',
  },
  skeletonImage: {
    backgroundColor: '#e0e0e0',
    borderRadius: 35,
    height: 70,
    width: 70,
  },
  skeletonText: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  timestamp: {
    color: '#999',
    fontSize: 12,
  },
  unreadBadge: {
    alignItems: 'center',
    backgroundColor: '#FF3B5C',
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  unreadCountBadge: {
    alignItems: 'center',
    backgroundColor: '#A0354E',
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unreadCountText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
