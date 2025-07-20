// UNUSED - Replaced by CleanSwipeCard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { saveSwipe, SwipeAction } from '../lib/swipes';
import { useAuthStore } from '../stores/useAuthStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Profile interface that matches our database
interface UserProfile {
  id: string;
  nickname: string;
  age: number;
  bio?: string;
  photos: string[];
  location?: string;
  hobbies?: string[];
}

interface SwipeCardProps {
  profile: UserProfile;
  onSwipeComplete: (action: SwipeAction, isMatch: boolean, matchId?: string) => void;
  onPhotoTap?: (index: number) => void;
}

export default function SwipeCard({
  profile,
  onSwipeComplete,
  onPhotoTap,
}: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthStore();
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Safety checks
  if (!profile || !profile.photos || profile.photos.length === 0 || !user) {
    return null;
  }

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
  };

  const resetPosition = () => {
    'worklet';
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
  };

  const handleSwipeAction = async (action: SwipeAction) => {
    if (isSaving || !user) return;
    
    setIsSaving(true);
    triggerHaptic();
    
    try {
      const result = await saveSwipe(user.id, profile.id, action);
      
      if (result.success) {
        if (result.isMatch) {
          // Show match celebration
          Alert.alert(
            "It's a Match! 🎉",
            `You and ${profile.nickname} liked each other!`,
            [
              { text: 'Send Message', onPress: () => onSwipeComplete(action, true, result.matchId) },
              { text: 'Keep Swiping', onPress: () => onSwipeComplete(action, true, result.matchId) },
            ]
          );
        } else {
          onSwipeComplete(action, false);
        }
      } else {
        // Handle error
        Alert.alert('Error', result.error?.message || 'Failed to save swipe');
        resetPosition();
      }
    } catch (error) {
      console.error('Swipe error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      resetPosition();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSwipeComplete = (direction: 'left' | 'right' | 'up') => {
    'worklet';
    
    // Reset animation values
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    opacity.value = 1;
    
    if (direction === 'left') {
      runOnJS(handleSwipeAction)('nope');
    } else if (direction === 'right') {
      runOnJS(handleSwipeAction)('like');
    } else if (direction === 'up') {
      runOnJS(handleSwipeAction)('super_like');
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(!isSaving)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const shouldSwipeLeft = event.translationX < -100;
      const shouldSwipeRight = event.translationX > 100;
      const shouldSwipeUp = event.translationY < -100;

      if (shouldSwipeLeft) {
        translateX.value = withTiming(-screenWidth * 1.5, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(handleSwipeComplete)('left');
        });
      } else if (shouldSwipeRight) {
        translateX.value = withTiming(screenWidth * 1.5, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(handleSwipeComplete)('right');
        });
      } else if (shouldSwipeUp) {
        translateY.value = withTiming(-screenHeight, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(handleSwipeComplete)('up');
        });
      } else {
        resetPosition();
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-15, 0, 15],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, screenWidth / 4],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-screenWidth / 4, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const superLikeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-screenHeight / 6, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const handlePhotoTap = (x: number) => {
    const cardWidth = screenWidth * 0.9;
    if (x < cardWidth / 3 && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
      triggerHaptic();
    } else if (x > (cardWidth * 2) / 3 && currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
      triggerHaptic();
    }
    onPhotoTap?.(currentPhotoIndex);
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedCardStyle]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => handlePhotoTap(e.nativeEvent.locationX)}
          disabled={isSaving}
        >
          <Image
            source={{ uri: profile.photos[currentPhotoIndex] }}
            style={styles.image}
            onLoadEnd={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          
          {imageLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}

          {/* Photo indicators */}
          {profile.photos.length > 1 && (
            <View style={styles.photoIndicator}>
              {profile.photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentPhotoIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <Text style={styles.name}>
              {profile.nickname}, {profile.age}
            </Text>
            <Text style={styles.location}>{profile.location || 'Location not set'}</Text>
            {profile.bio && (
              <Text style={styles.bio} numberOfLines={2}>
                {profile.bio}
              </Text>
            )}
            
            {/* Hobbies */}
            {profile.hobbies && profile.hobbies.length > 0 && (
              <View style={styles.hobbiesContainer}>
                {profile.hobbies.slice(0, 3).map((hobby, index) => (
                  <View key={index} style={styles.hobbyTag}>
                    <Text style={styles.hobbyText}>{hobby}</Text>
                  </View>
                ))}
              </View>
            )}
          </LinearGradient>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.dislikeButton]}
              onPress={() => handleSwipeAction('nope')}
              disabled={isSaving}
            >
              <Ionicons name="close" size={30} color="#FF4458" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.superLikeButton]}
              onPress={() => handleSwipeAction('super_like')}
              disabled={isSaving}
            >
              <Ionicons name="star" size={25} color="#44A1FF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.likeButton]}
              onPress={() => handleSwipeAction('like')}
              disabled={isSaving}
            >
              <Ionicons name="heart" size={30} color="#00D387" />
            </TouchableOpacity>
          </View>

          {/* Swipe labels */}
          <Animated.View style={[styles.likeLabel, likeOpacity]}>
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>
          
          <Animated.View style={[styles.nopeLabel, nopeOpacity]}>
            <Text style={styles.likeText}>NOPE</Text>
          </Animated.View>
          
          <Animated.View style={[styles.superLikeLabel, superLikeOpacity]}>
            <Text style={styles.superLikeText}>SUPER LIKE</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    backgroundColor: 'white',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  bio: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  hobbyTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  hobbyText: {
    color: 'white',
    fontSize: 14,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 50,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dislikeButton: {
    backgroundColor: 'white',
  },
  superLikeButton: {
    backgroundColor: 'white',
  },
  likeButton: {
    backgroundColor: 'white',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#999',
    fontSize: 16,
  },
  photoIndicator: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  dot: {
    width: 30,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
    marginHorizontal: 2,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  likeLabel: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    transform: [{ rotate: '-20deg' }],
  },
  likeText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  nopeLabel: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    transform: [{ rotate: '20deg' }],
  },
  superLikeLabel: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: 'rgba(68, 161, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
  },
  superLikeText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});