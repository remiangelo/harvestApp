import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // import CleanSwipeCard from '../../components/CleanSwipeCard';
import SafeSwipeCard from '../../components/SafeSwipeCard';
import { betterDemoProfiles as demoProfiles } from '../../data/betterDemoProfiles';
import { DemoProfile } from '../../data/demoProfiles';
import { theme } from '../../constants/theme';
import { useRouter } from 'expo-router';
import useUserStore from '../../stores/useUserStore';
import { filterProfiles, sortProfilesByRelevance } from '../../lib/filterProfiles';
import { MatchModal } from '../../components/MatchModal';
import { saveSwipe } from '../../lib/swipes';
import { useAuthStore } from '../../stores/useAuthStore';
import { ErrorBoundary } from '../../components/ErrorBoundary';

export default function SwipingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useUserStore();
  const { user, isTestMode } = useAuthStore();
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
  const validProfiles = filteredProfiles || [];
  const safeIndex = Math.max(0, Math.min(currentProfileIndex, validProfiles.length - 1));
  const currentProfile = validProfiles.length > 0 ? validProfiles[safeIndex] : null;

  const nextProfile = React.useCallback(() => {
    console.log('nextProfile called');
    setTimeout(() => {
      if (currentProfileIndex < validProfiles.length - 1) {
        setCurrentProfileIndex((prev) => prev + 1);
      } else {
        // Reset to beginning when we run out of profiles
        setCurrentProfileIndex(0);
        setLikedProfiles([]);
        setDislikedProfiles([]);
        Alert.alert('No More Profiles! 🔄', "You've seen all the demo profiles. Starting over...", [
          { text: 'OK', style: 'default' },
        ]);
      }
    }, 350); // Wait for animation to complete
  }, [currentProfileIndex, validProfiles.length]);

  const handleLike = React.useCallback(async () => {
    try {
      console.log('handleLike called');
      if (!currentProfile) {
        console.log('No current profile');
        return;
      }

      console.log('Current profile:', currentProfile.id);

      if (user && !isTestMode) {
        setLikedProfiles((prev) => [...prev, currentProfile.id]);

        // Save swipe to database
        const result = await saveSwipe(user.id, currentProfile.id, 'like');

        if (result.success && result.isMatch) {
          setMatchedProfile(currentProfile);
          setShowMatchModal(true);
        } else if (!result.success) {
          console.error('Failed to save swipe:', result.error);
        }

        nextProfile();
      } else {
        // Test mode or no user - just simulate
        console.log('Test mode - simulating like');
        setLikedProfiles((prev) => [...prev, currentProfile.id]);
        const isMatch = Math.random() > 0.3; // 70% match rate for demo
        if (isMatch) {
          setMatchedProfile(currentProfile);
          setShowMatchModal(true);
        }
        nextProfile();
      }
    } catch (error) {
      console.error('Error in handleLike:', error);
      Alert.alert('Error', 'Failed to process like. Please try again.');
      nextProfile();
    }
  }, [currentProfile, user, isTestMode, nextProfile]);

  const handleDislike = React.useCallback(async () => {
    try {
      console.log('handleDislike called');
      if (!currentProfile) {
        console.log('No current profile');
        return;
      }

      console.log('Current profile:', currentProfile.id);

      if (user && !isTestMode) {
        setDislikedProfiles((prev) => [...prev, currentProfile.id]);

        // Save swipe to database
        const result = await saveSwipe(user.id, currentProfile.id, 'nope');

        if (!result.success) {
          console.error('Failed to save swipe:', result.error);
        }

        nextProfile();
      } else {
        // Test mode or no user - just track locally
        console.log('Test mode - simulating dislike');
        setDislikedProfiles((prev) => [...prev, currentProfile.id]);
        nextProfile();
      }
    } catch (error) {
      console.error('Error in handleDislike:', error);
      Alert.alert('Error', 'Failed to process dislike. Please try again.');
      nextProfile();
    }
  }, [currentProfile, user, isTestMode, nextProfile]);

  const handleSuperLike = React.useCallback(async () => {
    try {
      console.log('handleSuperLike called');
      if (!currentProfile) {
        console.log('No current profile');
        return;
      }

      console.log('Current profile:', currentProfile.id);

      if (user && !isTestMode) {
        setLikedProfiles((prev) => [...prev, currentProfile.id]);

        // Save swipe to database
        const result = await saveSwipe(user.id, currentProfile.id, 'super_like');

        if (result.success && result.isMatch) {
          setMatchedProfile(currentProfile);
          setShowMatchModal(true);
        } else if (!result.success) {
          console.error('Failed to save swipe:', result.error);
        }

        nextProfile();
      } else {
        // Test mode or no user - just simulate
        console.log('Test mode - simulating super like');
        setLikedProfiles((prev) => [...prev, currentProfile.id]);
        // Super likes have higher match rate
        const isMatch = Math.random() > 0.1; // 90% match rate for super likes
        if (isMatch) {
          setMatchedProfile(currentProfile);
          setShowMatchModal(true);
        }
        nextProfile();
      }
    } catch (error) {
      console.error('Error in handleSuperLike:', error);
      Alert.alert('Error', 'Failed to process super like. Please try again.');
      nextProfile();
    }
  }, [currentProfile, user, isTestMode, nextProfile]);

  const resetProfiles = () => {
    setCurrentProfileIndex(0);
    setLikedProfiles([]);
    setDislikedProfiles([]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
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
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
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
    <ErrorBoundary>
      <View style={styles.container}>
        <SafeSwipeCard
          profile={currentProfile}
          onLike={handleLike}
          onDislike={handleDislike}
          onSuperLike={handleSuperLike}
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
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingBottom: 20,
    paddingHorizontal: 24,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
  logo: {
    color: theme.colors.primary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#555',
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.primary,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});
