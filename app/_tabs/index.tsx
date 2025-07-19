import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CleanSwipeCard from '../../components/CleanSwipeCard';
import { betterDemoProfiles as demoProfiles } from '../../data/betterDemoProfiles';
import { DemoProfile } from '../../data/demoProfiles';
import { theme } from '../../constants/theme';

export default function SwipingScreen() {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
  const [dislikedProfiles, setDislikedProfiles] = useState<string[]>([]);

  // Safety check for profiles array
  const validProfiles = demoProfiles || [];
  const safeIndex = Math.min(currentProfileIndex, validProfiles.length - 1);
  const currentProfile = validProfiles[safeIndex];

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
    if (currentProfileIndex < validProfiles.length - 1) {
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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Harvest</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>No Profiles Available</Text>
          <Text style={styles.subtitle}>Check back later for new matches!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CleanSwipeCard
        profile={currentProfile}
        onLike={handleLike}
        onDislike={handleDislike}
        onSuperLike={handleLike}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
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
