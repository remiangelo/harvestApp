import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DemoProfile } from '../data/demoProfiles';
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
      const dragDistance = Math.sqrt(
        event.translationX ** 2 + event.translationY ** 2
      );
      scale.value = interpolate(
        dragDistance,
        [0, 200],
        [1, 0.95],
        Extrapolation.CLAMP
      );
      
      // Trigger haptic when crossing threshold
      const shouldTriggerHaptic = Math.abs(event.translationX) > SWIPE_THRESHOLD || 
                                  (event.translationY < -SWIPE_THRESHOLD && Math.abs(event.translationX) < SWIPE_THRESHOLD);
      
      if (shouldTriggerHaptic && !hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = true;
        runOnJS(triggerHaptic)();
      } else if (!shouldTriggerHaptic && hasTriggeredHaptic.value) {
        hasTriggeredHaptic.value = false;
      }
    })
    .onEnd((event) => {
      const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD || event.velocityX < -SWIPE_VELOCITY;
      const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD || event.velocityX > SWIPE_VELOCITY;
      const shouldSwipeUp = event.translationY < -SWIPE_THRESHOLD && Math.abs(event.translationX) < SWIPE_THRESHOLD;

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
      opacity: interpolate(
        translateX.value,
        [0, screenWidth / 4],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  const nopeOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateX.value,
        [-screenWidth / 4, 0],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  const superLikeOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateY.value,
        [-screenHeight / 6, 0],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
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
          <Image
            source={{ uri: profile.photos[currentPhotoIndex] }}
            style={styles.photo}
            resizeMode="cover"
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
                style={[
                  styles.indicator,
                  index === currentPhotoIndex && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <View style={styles.basicInfo}>
            <Text style={styles.name}>{profile.name}, {profile.age}</Text>
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
  container: {
    width: screenWidth - 40,
    height: screenHeight * 0.7,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    position: 'absolute',
  },
  photoContainer: {
    flex: 1,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoIndicators: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  likeLabel: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#44d362',
    borderRadius: 8,
    transform: [{ rotate: '-20deg' }],
  },
  likeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#44d362',
  },
  nopeLabel: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#ff4757',
    borderRadius: 8,
    transform: [{ rotate: '20deg' }],
  },
  nopeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff4757',
  },
  superLikeLabel: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  superLikeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00b8d4',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
  basicInfo: {
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  bioContainer: {
    maxHeight: 80,
    marginBottom: 16,
  },
  bio: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
  hobbiesContainer: {
    marginBottom: 12,
  },
  hobbiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  hobbiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbyTag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  hobbyText: {
    fontSize: 14,
    color: '#495057',
  },
  goalsContainer: {
    marginBottom: 8,
  },
  goalsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
  },
  goalsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalTag: {
    backgroundColor: '#8B1E2D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  goalText: {
    fontSize: 14,
    color: 'white',
  },
});