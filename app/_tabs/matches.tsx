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
    online: true,
  },
  {
    id: '2',
    name: 'Clara Hazel',
    photo: 'https://i.pravatar.cc/150?img=6',
    online: false,
  },
  {
    id: '3',
    name: 'Brandon Aminoff',
    photo: 'https://i.pravatar.cc/150?img=7',
    online: false,
  },
  {
    id: '4',
    name: 'Amina Mina',
    photo: 'https://i.pravatar.cc/150?img=8',
    online: false,
  },
  {
    id: '5',
    name: 'Savanna Hall',
    photo: 'https://i.pravatar.cc/150?img=9',
    online: false,
  },
];

export default function MatchesScreen() {
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
                index === conversations.length - 1 && styles.lastItem,
              ]}
            >
              <View style={styles.avatarContainer}>
                <Image source={{ uri: match.photo }} style={styles.avatar} />
                {match.online && <View style={styles.onlineDot} />}
              </View>

              <View style={styles.conversationContent}>
                <Text style={styles.conversationName}>{match.name}</Text>
              </View>

              <View style={styles.conversationMeta}>
                <Ionicons name="chevron-forward" size={20} color="#999" />
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
  conversationItem: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 15,
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  conversationName: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
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
    marginBottom: 8,
  },
  unreadDot: {
    backgroundColor: '#A0354E',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
});
