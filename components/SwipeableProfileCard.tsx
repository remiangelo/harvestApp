// UNUSED - Replaced by CleanSwipeCard.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DemoProfile } from '../data/demoProfiles';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
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
import { OptimizedImage } from './OptimizedImage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.25;
const SWIPE_VELOCITY = 800;

interface SwipeableProfileCardProps {
  profile: DemoProfile;
  onLike: () => void;
  onDislike: () => void;
  onSuperLike?: () => void;
}

export default function SwipeableProfileCard({
  profile,
  onLike,
  onDislike,
  onSuperLike,
}: SwipeableProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const hasTriggeredHaptic = useSharedValue(false);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resetPosition = () => {
    'worklet';
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
    hasTriggeredHaptic.value = false;
  };

  const handleSwipeComplete = (direction: 'left' | 'right' | 'up') => {
    'worklet';
    runOnJS(triggerHaptic)();
    opacity.value = withTiming(0, { duration: 200 }, () => {
      if (direction === 'left') {
        runOnJS(onDislike)();
      } else if (direction === 'right') {
        runOnJS(onLike)();
      } else if (direction === 'up' && onSuperLike) {
        runOnJS(onSuperLike)();
      }
    });
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      // Scale down slightly when dragging
      const dragDistance = Math.sqrt(event.translationX ** 2 + event.translationY ** 2);
      scale.value = interpolate(dragDistance, [0, 200], [1, 0.95], Extrapolation.CLAMP);

      // Trigger haptic when crossing threshold
      const shouldTriggerHaptic =
        Math.abs(event.translationX) > SWIPE_THRESHOLD ||
        (event.translationY < -SWIPE_THRESHOLD && Math.abs(event.translationX) < SWIPE_THRESHOLD);

      if (shouldTriggerHaptic && !hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = true;
        runOnJS(triggerHaptic)();
      } else if (!shouldTriggerHaptic && hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = false;
      }
    })
    .onEnd((event) => {
      const shouldSwipeLeft =
        event.translationX < -SWIPE_THRESHOLD || event.velocityX < -SWIPE_VELOCITY;
      const shouldSwipeRight =
        event.translationX > SWIPE_THRESHOLD || event.velocityX > SWIPE_VELOCITY;
      const shouldSwipeUp =
        event.translationY < -SWIPE_THRESHOLD && Math.abs(event.translationX) < SWIPE_THRESHOLD;

      if (shouldSwipeLeft) {
        translateX.value = withSpring(-screenWidth * 1.5);
        handleSwipeComplete('left');
      } else if (shouldSwipeRight) {
        translateX.value = withSpring(screenWidth * 1.5);
        handleSwipeComplete('right');
      } else if (shouldSwipeUp && onSuperLike) {
        translateY.value = withSpring(-screenHeight);
        handleSwipeComplete('up');
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

  const likeOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(translateX.value, [0, screenWidth / 4], [0, 1], Extrapolation.CLAMP),
    };
  });

  const nopeOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(translateX.value, [-screenWidth / 4, 0], [1, 0], Extrapolation.CLAMP),
    };
  });

  const superLikeOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(translateY.value, [-screenHeight / 6, 0], [1, 0], Extrapolation.CLAMP),
    };
  });

  const tapGesture = Gesture.Tap().onEnd((event) => {
    const tapX = event.x;
    const cardWidth = screenWidth - 40;

    if (tapX < cardWidth / 3 && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    } else if (tapX > (cardWidth * 2) / 3 && currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  });

  const composedGesture = Gesture.Simultaneous(tapGesture, panGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedCardStyle]}>
        {/* Photo Section */}
        <View style={styles.photoContainer}>
          <OptimizedImage
            source={{ uri: profile.photos[currentPhotoIndex] }}
            style={styles.photo}
            resizeMode="cover"
            showLoadingIndicator={true}
          />

          {/* Swipe Indicators */}
          <Animated.View style={[styles.likeLabel, likeOpacityStyle]}>
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>

          <Animated.View style={[styles.nopeLabel, nopeOpacityStyle]}>
            <Text style={styles.nopeText}>NOPE</Text>
          </Animated.View>

          {onSuperLike && (
            <Animated.View style={[styles.superLikeLabel, superLikeOpacityStyle]}>
              <Text style={styles.superLikeText}>SUPER LIKE</Text>
            </Animated.View>
          )}

          {/* Photo Indicators */}
          <View style={styles.photoIndicators}>
            {profile.photos.map((_, index) => (
              <View
                key={index}
                style={[styles.indicator, index === currentPhotoIndex && styles.activeIndicator]}
              />
            ))}
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <View style={styles.basicInfo}>
            <Text style={styles.name}>
              {profile.name}, {profile.age}
            </Text>
            <Text style={styles.location}>{profile.location}</Text>
          </View>

          <ScrollView style={styles.bioContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.bio}>{profile.bio}</Text>
          </ScrollView>

          {/* Hobbies */}
          <View style={styles.hobbiesContainer}>
            <Text style={styles.hobbiesTitle}>Interests</Text>
            <View style={styles.hobbiesList}>
              {profile.hobbies.slice(0, 4).map((hobby, index) => (
                <View key={index} style={styles.hobbyTag}>
                  <Text style={styles.hobbyText}>{hobby}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Relationship Goals */}
          <View style={styles.goalsContainer}>
            <Text style={styles.goalsTitle}>Looking for</Text>
            <View style={styles.goalsList}>
              {profile.relationshipGoals.map((goal, index) => (
                <View key={index} style={styles.goalTag}>
                  <Text style={styles.goalText}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  activeIndicator: {
    backgroundColor: 'white',
  },
  basicInfo: {
    marginBottom: 12,
  },
  bio: {
    color: '#444',
    fontSize: 16,
    lineHeight: 22,
  },
  bioContainer: {
    marginBottom: 16,
    maxHeight: 80,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 5,
    height: screenHeight * 0.7,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: screenWidth - 40,
  },
  goalTag: {
    backgroundColor: '#8B1E2D',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  goalText: {
    color: 'white',
    fontSize: 14,
  },
  goalsContainer: {
    marginBottom: 8,
  },
  goalsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalsTitle: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  hobbiesContainer: {
    marginBottom: 12,
  },
  hobbiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbiesTitle: {
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  hobbyTag: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hobbyText: {
    color: '#495057',
    fontSize: 14,
  },
  indicator: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 20,
  },
  likeLabel: {
    borderColor: '#44d362',
    borderRadius: 8,
    borderWidth: 3,
    left: 20,
    padding: 8,
    position: 'absolute',
    top: 50,
    transform: [{ rotate: '-20deg' }],
  },
  likeText: {
    color: '#44d362',
    fontSize: 32,
    fontWeight: 'bold',
  },
  location: {
    color: '#666',
    fontSize: 16,
  },
  name: {
    color: '#222',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nopeLabel: {
    borderColor: '#ff4757',
    borderRadius: 8,
    borderWidth: 3,
    padding: 8,
    position: 'absolute',
    right: 20,
    top: 50,
    transform: [{ rotate: '20deg' }],
  },
  nopeText: {
    color: '#ff4757',
    fontSize: 32,
    fontWeight: 'bold',
  },
  photo: {
    height: '100%',
    width: '100%',
  },
  photoContainer: {
    flex: 1,
    position: 'relative',
  },
  photoIndicators: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 20,
  },
  superLikeLabel: {
    alignItems: 'center',
    bottom: 50,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  superLikeText: {
    color: '#00b8d4',
    fontSize: 32,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
