// UNUSED - Replaced by CleanSwipeCard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
import Svg, { Circle } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth;
const CARD_HEIGHT = screenHeight;
const SWIPE_THRESHOLD = screenWidth * 0.25;
const SWIPE_VELOCITY = 800;

interface MockupSwipeCardProps {
  profile: DemoProfile;
  onLike: () => void;
  onDislike: () => void;
  onSuperLike?: () => void;
}

// Circular progress component matching the mockup exactly
const CircularProgress = ({ percentage, color, label }: { percentage: number; color: string; label: string }) => {
  const radius = 25;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={styles.progressContainer}>
      <Svg width={60} height={60}>
        {/* Background circle */}
        <Circle
          cx={30}
          cy={30}
          r={radius}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={30}
          cy={30}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 30 30)"
        />
      </Svg>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressPercentage}>{percentage}%</Text>
        <Text style={styles.progressLabel}>{label}</Text>
      </View>
    </View>
  );
};

export default function MockupSwipeCard({
  profile,
  onLike,
  onDislike,
  onSuperLike,
}: MockupSwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Safety check for profile and photos
  if (!profile || !profile.photos || profile.photos.length === 0) {
    return null;
  }
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Fixed compatibility scores to match mockup
  const scores = {
    interests: 95,
    personality: 98,
    match: 96,
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel any pending animations
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 1;
      opacity.value = 1;
    };
  }, []);

  const triggerHaptic = () => {
    try {
      if (Haptics && Haptics.impactAsync) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
          // Silently ignore haptics errors
        });
      }
    } catch (error) {
      // Silently fail if haptics not available
      // Haptics not available
    }
  };

  const resetPosition = () => {
    'worklet';
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
  };

  const handleSwipeComplete = (direction: 'left' | 'right' | 'up') => {
    'worklet';
    runOnJS(triggerHaptic)();
    
    // Reset animation values
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    opacity.value = 1;
    
    if (direction === 'left') {
      runOnJS(onDislike)();
    } else if (direction === 'right') {
      runOnJS(onLike)();
    } else if (direction === 'up' && onSuperLike) {
      runOnJS(onSuperLike)();
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      
      const dragDistance = Math.sqrt(
        event.translationX ** 2 + event.translationY ** 2
      );
      scale.value = interpolate(
        dragDistance,
        [0, 200],
        [1, 0.95],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      const shouldSwipeLeft = event.translationX < -SWIPE_THRESHOLD || event.velocityX < -SWIPE_VELOCITY;
      const shouldSwipeRight = event.translationX > SWIPE_THRESHOLD || event.velocityX > SWIPE_VELOCITY;
      const shouldSwipeUp = event.translationY < -SWIPE_THRESHOLD && Math.abs(event.translationX) < SWIPE_THRESHOLD;

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
      } else if (shouldSwipeUp && onSuperLike) {
        translateY.value = withTiming(-screenHeight, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(handleSwipeComplete)('up');
        });
      } else {
        resetPosition();
      }
    })
    .runOnJS(true);

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

  const likeOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, screenWidth / 4],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const nopeOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-screenWidth / 4, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <View style={styles.container}>
      {/* Purple/pink gradient background matching mockup */}
      <LinearGradient
        colors={['#E6D7F1', '#F4E4E9', '#FAF0F3']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.gradientBackground}
      />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          {/* Full-screen photo */}
          <Image
            source={{ uri: profile.photos[Math.min(currentPhotoIndex, profile.photos.length - 1)] }}
            style={styles.photo}
            resizeMode="cover"
          />

          {/* Swipe indicators */}
          <Animated.View style={[styles.likeIndicator, likeOpacityStyle]}>
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>
          
          <Animated.View style={[styles.nopeIndicator, nopeOpacityStyle]}>
            <Text style={styles.nopeText}>NOPE</Text>
          </Animated.View>

          {/* Bottom info section with frosted glass */}
          <BlurView intensity={80} tint="dark" style={styles.infoSection}>
            {/* Name and age */}
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.name}</Text>
              <View style={styles.ageContainer}>
                <Text style={styles.age}>{profile.age}</Text>
              </View>
            </View>

            {/* Compatibility meters */}
            <View style={styles.metersRow}>
              <CircularProgress percentage={scores.interests} color="#4ECDC4" label="Interests" />
              <CircularProgress percentage={scores.personality} color="#FFE66D" label="Personality" />
              <CircularProgress percentage={scores.match} color="#95E1D3" label="Match" />
            </View>

            {/* Hashtags */}
            <View style={styles.tagsRow}>
              {['#nature', '#books', '#travel', '#movies', '#filmmaking'].map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Bio */}
            <Text style={styles.bio} numberOfLines={3}>
              {profile.bio || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque eu fermentum lorem, vitae gravida sapien. In sed risus nibh. Integer vulputate imperdiet arcu."}
            </Text>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
                <View style={styles.iconCircle}>
                  <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
                <View style={styles.iconCircle}>
                  <Ionicons name="home-outline" size={24} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons name="cart-outline" size={24} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  photo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  likeIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(76, 217, 100, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    transform: [{ rotate: '-20deg' }],
  },
  likeText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  nopeIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    transform: [{ rotate: '20deg' }],
  },
  nopeText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  infoSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  ageContainer: {
    backgroundColor: '#A0354E',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 10,
  },
  age: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  metersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  progressContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  progressTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressLabel: {
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: -2,
    opacity: 0.8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: '#A0354E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  bio: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 20,
    opacity: 0.9,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
  actionButton: {
    padding: 5,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});