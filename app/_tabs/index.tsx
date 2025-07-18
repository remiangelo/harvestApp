import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProfileCard from '../../components/ProfileCard';
import { demoProfiles, DemoProfile } from '../../data/demoProfiles';

export default function SwipingScreen() {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
  const [dislikedProfiles, setDislikedProfiles] = useState<string[]>([]);

  const currentProfile = demoProfiles[currentProfileIndex];

  const handleLike = () => {
    if (currentProfile) {
      setLikedProfiles(prev => [...prev, currentProfile.id]);
      Alert.alert(
        'It\'s a Match! 💕',
        `You liked ${currentProfile.name}! This would trigger a match notification in the real app.`,
        [{ text: 'Continue Swiping', style: 'default' }]
      );
      nextProfile();
    }
  };

  const handleDislike = () => {
    if (currentProfile) {
      setDislikedProfiles(prev => [...prev, currentProfile.id]);
      nextProfile();
    }
  };

  const nextProfile = () => {
    if (currentProfileIndex < demoProfiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      // Reset to beginning when we run out of profiles
      setCurrentProfileIndex(0);
      setLikedProfiles([]);
      setDislikedProfiles([]);
      Alert.alert(
        'No More Profiles! 🔄',
        'You\'ve seen all the demo profiles. Starting over...',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const resetProfiles = () => {
    setCurrentProfileIndex(0);
    setLikedProfiles([]);
    setDislikedProfiles([]);
  };

  if (!currentProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Harvest</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>No Profiles Available</Text>
          <Text style={styles.subtitle}>Check back later for new matches!</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Harvest</Text>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>
            {currentProfileIndex + 1} of {demoProfiles.length}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <ProfileCard
          profile={currentProfile}
          onLike={handleLike}
          onDislike={handleDislike}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={20} color="#8B1E2D" />
            <Text style={styles.statText}>{likedProfiles.length} liked</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="close" size={20} color="#ff4757" />
            <Text style={styles.statText}>{dislikedProfiles.length} passed</Text>
          </View>
        </View>
        
        <View style={styles.resetContainer}>
          <Text style={styles.resetText} onPress={resetProfiles}>
            Reset Demo
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B1E2D',
  },
  headerStats: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  resetContainer: {
    alignItems: 'center',
  },
  resetText: {
    fontSize: 16,
    color: '#8B1E2D',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B1E2D',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 24,
    textAlign: 'center',
  },
});
