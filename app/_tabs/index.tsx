import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
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
import useSubscriptionStore from '../../stores/useSubscriptionStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { formatLimitMessage } from '../../lib/subscription';

export default function SwipingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser } = useUserStore();
  const { user, isTestMode } = useAuthStore();
  const {
    tier,
    usage,
    canMatch,
    incrementMatchCount,
    fetchSubscription,
    fetchUsage,
    getMaxDistance,
    tierDetails,
  } = useSubscriptionStore();
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const [nextProfiles, setNextProfiles] = useState<any[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Load subscription and usage data
  useEffect(() => {
    if (user?.id) {
      fetchSubscription(user.id);
      fetchUsage(user.id);
    }
  }, [user?.id]);

  // Fetch real users from the database
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) {
        // If no user, show demo mode message
        setIsLoading(false);
        return;
      }

      try {
        // First, fetch the current user's profile to get their preferences
        const { data: myProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error fetching my profile:', profileError);
        }

        console.log('[SwipingScreen] My profile:', {
          id: myProfile?.id,
          gender: myProfile?.gender,
          interested_in: myProfile?.interested_in,
          onboarding_completed: myProfile?.onboarding_completed,
        });

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

        console.log('[SwipingScreen] Fetched profiles:', profiles?.length, 'profiles');
        profiles?.forEach((p: any) => {
          console.log(
            `  - ${p.nickname || p.id}: gender=${p.gender}, interested_in=${JSON.stringify(p.interested_in)}`
          );
        });

        // Filter out already swiped profiles
        const { data: swipes } = await supabase
          .from('swipes')
          .select('swiped_id')
          .eq('swiper_id', user.id);

        const swipedIds = swipes?.map((s: any) => s.swiped_id) || [];
        const unseenProfiles = profiles?.filter((p: any) => !swipedIds.includes(p.id)) || [];

        console.log('[SwipingScreen] Unseen profiles:', unseenProfiles.length);

        // Apply user preferences filter using the fresh profile data
        const userPrefs = myProfile || currentUser;
        const filtered = filterProfiles(unseenProfiles, userPrefs);
        const sorted = sortProfilesByRelevance(filtered, userPrefs);

        console.log('[SwipingScreen] After filtering:', sorted.length, 'profiles');

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

      // Check if user has reached their match limit
      if (!canMatch()) {
        const remaining = tierDetails?.matches_per_week
          ? tierDetails.matches_per_week - (usage?.matches_count || 0)
          : 0;
        const limitMessage = formatLimitMessage('matches', tier, remaining);
        Alert.alert('Match Limit Reached', limitMessage, [
          { text: 'Upgrade', onPress: () => setShowUpgradeModal(true) },
          { text: 'OK', style: 'cancel' },
        ]);
        return;
      }

      if (user && !isTestMode) {
        // Increment match count before saving
        const canProceed = await incrementMatchCount(user.id);
        if (!canProceed) {
          setShowUpgradeModal(true);
          return;
        }

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
  }, [
    currentProfile,
    user,
    isTestMode,
    nextProfile,
    canMatch,
    incrementMatchCount,
    tier,
    tierDetails,
    usage,
  ]);

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
        const result = await saveSwipe(user.id, currentProfile.id, 'super_like');

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
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateIconContainer}>
            <Ionicons name="search-outline" size={64} color={theme.colors.primary} />
          </View>
          <Text style={styles.emptyStateTitle}>No Profiles Found</Text>
          <Text style={styles.emptyStateSubtitle}>
            Try adjusting your filters to see more people in your area
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => router.push('/filters' as any)}
          >
            <Ionicons name="options-outline" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.emptyStateButtonText}>Adjust Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.emptyStateSecondaryButton}
            onPress={() => {
              setIsLoading(true);
              setFilteredProfiles([]);
              setCurrentProfileIndex(0);
              // Re-trigger the useEffect by updating a dependency
              setTimeout(() => setIsLoading(false), 100);
            }}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={theme.colors.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.emptyStateSecondaryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {/* Upgrade Modal */}
        <UpgradeModal
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          highlightFeature="matching"
          title="Unlock Unlimited Matches"
          subtitle="Upgrade to Green or Gold for unlimited matching"
        />

        {/* Matches remaining indicator for Seed tier */}
        {tier === 'seed' && tierDetails?.matches_per_week && (
          <View
            style={[
              styles.matchesRemaining,
              { top: insets.top + (Platform.OS === 'android' ? 20 : 10) },
            ]}
          >
            <Ionicons name="heart" size={14} color={theme.colors.primary} />
            <Text style={styles.matchesRemainingText}>
              {Math.max(0, tierDetails.matches_per_week - (usage?.matches_count || 0))} left
            </Text>
          </View>
        )}

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
  emptyStateButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 25,
    flexDirection: 'row',
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateIconContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    marginBottom: 24,
    width: 120,
  },
  emptyStateSecondaryButton: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  emptyStateSecondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyStateSubtitle: {
    color: '#888',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyStateTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
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
  matchesRemaining: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    flexDirection: 'row',
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    position: 'absolute',
    zIndex: 100,
  },
  matchesRemainingText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
});
