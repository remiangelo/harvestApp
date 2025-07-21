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

interface Match {
  id: string;
  name: string;
  photo: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  online: boolean;
}

const recentMatches = [
  { id: '1', name: 'Sarah', photo: 'https://i.pravatar.cc/150?img=1', likes: 32 },
  { id: '2', name: 'John', photo: 'https://i.pravatar.cc/150?img=2', likes: 0 },
  { id: '3', name: 'Emma', photo: 'https://i.pravatar.cc/150?img=3', likes: 0 },
  { id: '4', name: 'Alex', photo: 'https://i.pravatar.cc/150?img=4', likes: 0 },
];

const conversations: Match[] = [
  {
    id: '1',
    name: 'Alfredo Calzoni',
    photo: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'What about that new jacket if I...',
    timestamp: '09:18',
    unread: true,
    online: true,
  },
  {
    id: '2',
    name: 'Clara Hazel',
    photo: 'https://i.pravatar.cc/150?img=6',
    lastMessage: 'I know right 😊',
    timestamp: '12:44',
    unread: true,
    online: false,
  },
  {
    id: '3',
    name: 'Brandon Aminoff',
    photo: 'https://i.pravatar.cc/150?img=7',
    lastMessage: "I've already registered, can't wai...",
    timestamp: '08:06',
    unread: false,
    online: false,
  },
  {
    id: '4',
    name: 'Amina Mina',
    photo: 'https://i.pravatar.cc/150?img=8',
    lastMessage: 'It will have two lines of heading ...',
    timestamp: '09:32',
    unread: false,
    online: false,
  },
  {
    id: '5',
    name: 'Savanna Hall',
    photo: 'https://i.pravatar.cc/150?img=9',
    lastMessage: 'It will have two lines of heading ...',
    timestamp: '06:21',
    unread: false,
    online: false,
  },
];

export default function MatchesScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with gradient background */}
      <LinearGradient
        colors={['#A0354E', '#8B1E2D']}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Matches</Text>
            <View style={{ width: 28 }} />
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
          {conversations.map((match, index) => (
            <TouchableOpacity 
              key={match.id} 
              style={[
                styles.conversationItem,
                index === conversations.length - 1 && styles.lastItem
              ]}
            >
              <View style={styles.avatarContainer}>
                <Image source={{ uri: match.photo }} style={styles.avatar} />
                {match.online && <View style={styles.onlineDot} />}
              </View>
              
              <View style={styles.conversationContent}>
                <Text style={styles.conversationName}>{match.name}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {match.lastMessage}
                </Text>
              </View>
              
              <View style={styles.conversationMeta}>
                <Text style={styles.timestamp}>{match.timestamp}</Text>
                {match.unread && <View style={styles.unreadDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LiquidGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerGradient: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  recentMatchesContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
  },
  matchesScroll: {
    paddingRight: 20,
  },
  matchItem: {
    marginRight: 15,
  },
  matchImageContainer: {
    position: 'relative',
  },
  matchImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  likeBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FF3B5C',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  conversationsContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 25,
    paddingHorizontal: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: 'white',
  },
  conversationContent: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A0354E',
  },
});