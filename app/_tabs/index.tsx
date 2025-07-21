import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CleanSwipeCard from '../../components/CleanSwipeCard';
import { betterDemoProfiles as demoProfiles } from '../../data/betterDemoProfiles';
import { DemoProfile } from '../../data/demoProfiles';
import { theme } from '../../constants/theme';
import { useRouter } from 'expo-router';
import useUserStore from '../../stores/useUserStore';
import { filterProfiles, sortProfilesByRelevance } from '../../lib/filterProfiles';
import { MatchModal } from '../../components/MatchModal';

export default function SwipingScreen() {
  const router = useRouter();
  const { currentUser } = useUserStore();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState<string[]>([]);
  const [dislikedProfiles, setDislikedProfiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProfiles, setFilteredProfiles] = useState<DemoProfile[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<DemoProfile | null>(null);

  // Filter and sort profiles based on user preferences
  useEffect(() => {
    // In a real app, this would fetch profiles from the backend
    setTimeout(() => {
      const filtered = filterProfiles(demoProfiles || [], currentUser);
      const sorted = sortProfilesByRelevance(filtered, currentUser);
      setFilteredProfiles(sorted);
      setIsLoading(false);
    }, 1000);
  }, [currentUser]);

  // Safety check for profiles array
  const validProfiles = filteredProfiles;
  const safeIndex = Math.min(currentProfileIndex, validProfiles.length - 1);
  const currentProfile = validProfiles[safeIndex];

  const handleLike = () => {
    if (currentProfile) {
      setLikedProfiles(prev => [...prev, currentProfile.id]);
      // Simulate a match (in real app, check if they liked you back)
      const isMatch = Math.random() > 0.3; // 70% match rate for demo
      if (isMatch) {
        setMatchedProfile(currentProfile);
        setShowMatchModal(true);
      }
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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Harvest</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => router.push('/filters' as any)}
          >
            <Ionicons name="options-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading profiles...</Text>
        </View>
      </View>
    );
  }

  if (!currentProfile) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Harvest</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => router.push('/filters' as any)}
          >
            <Ionicons name="options-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
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
      
      {matchedProfile && (
        <MatchModal
          visible={showMatchModal}
          onClose={() => {
            setShowMatchModal(false);
            setMatchedProfile(null);
          }}
          userProfile={{
            name: currentUser?.name || 'You',
            photo: currentUser?.photos?.[0] || 'https://i.pravatar.cc/150?img=1',
          }}
          matchProfile={{
            name: matchedProfile.name,
            photo: matchedProfile.photos[0],
          }}
          compatibility={{
            interests: 95,
            personality: 98,
            overall: 96,
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  filterButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
});
