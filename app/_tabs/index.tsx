import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HarvestSwipeCard from '../../components/HarvestSwipeCard';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';
import { useRouter } from 'expo-router';
import useUserStore from '../../stores/useUserStore';
import { filterProfiles, sortProfilesByRelevance } from '../../lib/filterProfiles';
import { MatchModal } from '../../components/MatchModal';
import { saveSwipe } from '../../lib/swipes';
import { useAuthStore } from '../../stores/useAuthStore';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { notificationService } from '../../lib/notifications';

export default function SwipingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useUserStore();
  const { user, isTestMode } = useAuthStore();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const [nextProfiles, setNextProfiles] = useState<any[]>([]);

  // Fetch real users from the database
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) {
        // If no user, show demo mode message
        setIsLoading(false);
        return;
      }

      try {
        // Fetch users who haven't been swiped on yet
        const { data: profiles, error } = await supabase
          .from('users')
          .select('*')
          .neq('id', user.id) // Don't show current user
          .eq('onboarding_completed', true) // Only show users who completed onboarding
          .limit(50);

        if (error) {
          console.error('Error fetching profiles:', error);
          setIsLoading(false);
          return;
        }

        // Filter out already swiped profiles
        const { data: swipes } = await supabase
          .from('swipes')
          .select('swiped_id')
          .eq('swiper_id', user.id);

        const swipedIds = swipes?.map((s: any) => s.swiped_id) || [];
        const unseenProfiles = profiles?.filter((p: any) => !swipedIds.includes(p.id)) || [];

        // Apply user preferences filter
        const filtered = filterProfiles(unseenProfiles, currentUser);
        const sorted = sortProfilesByRelevance(filtered, currentUser);

        setFilteredProfiles(sorted);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading profiles:', error);
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [currentUser, user]);

  // Safety check for profiles array
  const validProfiles = filteredProfiles || [];
  const safeIndex = Math.max(0, Math.min(currentProfileIndex, validProfiles.length - 1));
  const currentProfile = validProfiles.length > 0 ? validProfiles[safeIndex] : null;

  const nextProfile = React.useCallback(() => {
    setTimeout(() => {
      if (currentProfileIndex < validProfiles.length - 1) {
        setCurrentProfileIndex((prev) => prev + 1);
        // Preload next 3 profiles
        const nextProfilesToLoad = [];
        for (let i = 1; i <= 3; i++) {
          const nextIndex = currentProfileIndex + i;
          if (nextIndex < validProfiles.length) {
            nextProfilesToLoad.push(validProfiles[nextIndex]);
          }
        }
        setNextProfiles(nextProfilesToLoad);
      } else {
        // Reset to beginning when we run out of profiles
        setCurrentProfileIndex(0);
        setNextProfiles([]);
        Alert.alert('No More Profiles! 👋', 'Check back later for new matches!', [
          { text: 'OK', style: 'default' },
        ]);
      }
    }, 350); // Wait for animation to complete
  }, [currentProfileIndex, validProfiles.length]);

  const handleLike = React.useCallback(async () => {
    try {
      if (!currentProfile) {
        return;
      }

      if (user && !isTestMode) {
        // Save swipe to database
        const result = await saveSwipe(user.id, currentProfile.id, 'like');

        if (result.success && result.isMatch) {
          setMatchedProfile(currentProfile);
          setShowMatchModal(true);
          // Send match notification
          await notificationService.sendMatchNotification(
            currentProfile.name,
            currentProfile.photos?.[0] || ''
          );
        } else if (!result.success) {
          console.error('Failed to save swipe:', result.error);
        }

        nextProfile();
      } else {
        // Test mode or no user - just simulate
        // Test mode - simulating like
        const isMatch = Math.random() > 0.3; // 70% match rate for demo
        if (isMatch) {
          setMatchedProfile(currentProfile);
          setShowMatchModal(true);
          // Send match notification
          await notificationService.sendMatchNotification(
            currentProfile.name,
            currentProfile.photos?.[0] || ''
          );
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
      if (!currentProfile) {
        return;
      }

      if (user && !isTestMode) {
        // Save swipe to database
        const result = await saveSwipe(user.id, currentProfile.id, 'nope');

        if (!result.success) {
          console.error('Failed to save swipe:', result.error);
        }

        nextProfile();
      } else {
        // Test mode or no user - just track locally
        // Test mode - simulating dislike
        nextProfile();
      }
    } catch (error) {
      console.error('Error in handleDislike:', error);
      Alert.alert('Error', 'Failed to process dislike. Please try again.');
      nextProfile();
    }
  }, [currentProfile, user, isTestMode, nextProfile]);

  const handleTopPick = React.useCallback(async () => {
    try {
      if (!currentProfile) {
        return;
      }

      if (user && !isTestMode) {
        // Save swipe to database
        const result = await saveSwipe(user.id, currentProfile.id, 'top_pick');

        if (result.success && result.isMatch) {
          setMatchedProfile(currentProfile);
          setShowMatchModal(true);
          // Send match notification
          await notificationService.sendMatchNotification(
            currentProfile.name,
            currentProfile.photos?.[0] || ''
          );
        } else if (!result.success) {
          console.error('Failed to save swipe:', result.error);
        }

        nextProfile();
      } else {
        // Test mode or no user - just simulate
        // Test mode - simulating top pick
        // Top picks have higher match rate
        const isMatch = Math.random() > 0.1; // 90% match rate for top picks
        if (isMatch) {
          setMatchedProfile(currentProfile);
          setShowMatchModal(true);
        }
        nextProfile();
      }
    } catch (error) {
      console.error('Error in handleTopPick:', error);
      Alert.alert('Error', 'Failed to process top pick. Please try again.');
      nextProfile();
    }
  }, [currentProfile, user, isTestMode, nextProfile]);

  if (isLoading) {
    return (
      <View style={styles.container}>
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
        {/* Filters button in top right */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              top: insets.top + (Platform.OS === 'android' ? 20 : 10),
            },
          ]}
          onPress={() => router.push('/filters' as any)}
        >
          <Ionicons name="options-outline" size={24} color="white" />
        </TouchableOpacity>

        <HarvestSwipeCard
          profile={currentProfile}
          nextProfiles={nextProfiles}
          onLike={handleLike}
          onDislike={handleDislike}
          onSuperLike={handleTopPick}
        />

        {matchedProfile && (
          <MatchModal
            visible={showMatchModal}
            onClose={() => {
              setShowMatchModal(false);
              setMatchedProfile(null);
            }}
            onSendMessage={() => {
              // TODO: Navigate to chat screen
            }}
            userProfile={{
              name: currentUser?.name || 'You',
              photo: currentUser?.photos?.[0] || 'https://i.pravatar.cc/150?img=1',
            }}
            matchProfile={{
              name: matchedProfile.name,
              photo: matchedProfile.photos?.[0] || '',
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 22,
    elevation: 5,
    padding: 10,
    position: 'absolute',
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 100,
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
