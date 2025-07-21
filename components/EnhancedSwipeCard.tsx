// UNUSED - Replaced by CleanSwipeCard.tsx
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
import { theme } from '../constants/theme';
import { Tag } from './ui';
import Svg, { Circle } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.25;
const SWIPE_VELOCITY = 800;

interface EnhancedSwipeCardProps {
  profile: DemoProfile;
  onLike: () => void;
  onDislike: () => void;
  onSuperLike?: () => void;
}

// Animated circular progress component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgress = ({
  percentage,
  color,
  label,
}: {
  percentage: number;
  color: string;
  label: string;
}) => {
  const radius = 30;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  // Ensure percentage is between 0 and 100
  const safePercentage = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (safePercentage / 100) * circumference;

  return (
    <View style={styles.metricContainer}>
      <Svg width={70} height={70} style={styles.metricSvg}>
        {/* Background circle */}
        <Circle
          cx={35}
          cy={35}
          r={radius}
          stroke={theme.colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={35}
          cy={35}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 35 35)`}
        />
      </Svg>
      <View style={styles.metricContent}>
        <Text style={styles.metricPercentage}>{percentage}%</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
    </View>
  );
};

export default function EnhancedSwipeCard({
  profile,
  onLike,
  onDislike,
  onSuperLike,
}: EnhancedSwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const hasTriggeredHaptic = useSharedValue(false);

  // Mock compatibility scores (in real app, calculate from user preferences)
  const compatibilityScores = {
    interests: Math.floor(Math.random() * 30 + 70), // 70-100%
    personality: Math.floor(Math.random() * 30 + 65), // 65-95%
    overall: Math.floor(Math.random() * 30 + 70), // 70-100%
  };

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

      const dragDistance = Math.sqrt(event.translationX ** 2 + event.translationY ** 2);
      scale.value = interpolate(dragDistance, [0, 200], [1, 0.98], Extrapolation.CLAMP);

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

  const likeOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, screenWidth / 4], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-screenWidth / 4, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const superLikeOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [-screenHeight / 6, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const tapGesture = Gesture.Tap().onEnd((event) => {
    const tapX = event.x;
    const cardWidth = screenWidth - 32;

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
        {/* Main photo with gradient overlay */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: profile.photos[currentPhotoIndex] }}
            style={styles.photo}
            resizeMode="cover"
          />

          {/* Gradient overlay */}
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.gradient} />

          {/* Photo indicators */}
          <View style={styles.photoIndicators}>
            {profile.photos.map((_, index) => (
              <View
                key={index}
                style={[styles.indicator, index === currentPhotoIndex && styles.activeIndicator]}
              />
            ))}
          </View>

          {/* Swipe indicators */}
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

          {/* Profile info overlay with glass effect */}
          <BlurView intensity={80} tint="dark" style={styles.infoOverlay}>
            <View style={styles.infoContent}>
              {/* Name and basic info */}
              <View style={styles.headerRow}>
                <View style={styles.nameContainer}>
                  <Text style={styles.name}>{profile.name}</Text>
                  <Text style={styles.age}>{profile.age}</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                </View>
              </View>

              {/* Compatibility metrics */}
              <View style={styles.metricsRow}>
                <CircularProgress
                  percentage={compatibilityScores.interests}
                  color={theme.colors.primary}
                  label="Interests"
                />
                <CircularProgress
                  percentage={compatibilityScores.personality}
                  color={theme.colors.success}
                  label="Personality"
                />
                <CircularProgress
                  percentage={compatibilityScores.overall}
                  color={theme.colors.info}
                  label="Match"
                />
              </View>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {profile.hobbies.slice(0, 4).map((hobby, index) => (
                  <Tag
                    key={index}
                    label={hobby}
                    variant="primary"
                    size="small"
                    style={styles.tag}
                  />
                ))}
                {profile.hobbies.length > 4 && (
                  <Tag
                    label={`+${profile.hobbies.length - 4}`}
                    variant="outline"
                    size="small"
                    style={styles.tag}
                  />
                )}
              </View>

              {/* Bio preview */}
              <Text style={styles.bio} numberOfLines={2}>
                {profile.bio}
              </Text>

              {/* Action buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => {
                    triggerHaptic();
                    onDislike();
                  }}
                >
                  <Ionicons name="close" size={30} color={theme.colors.nope} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.superLikeButton]}
                  onPress={() => {
                    if (onSuperLike) {
                      triggerHaptic();
                      onSuperLike();
                    }
                  }}
                >
                  <Ionicons name="star" size={28} color={theme.colors.superLike} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.likeButton]}
                  onPress={() => {
                    triggerHaptic();
                    onLike();
                  }}
                >
                  <Ionicons name="heart" size={28} color={theme.colors.like} />
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  age: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize['2xl'],
    opacity: 0.9,
  },
  bio: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.base,
    lineHeight: theme.typography.fontSize.base * 1.4,
    opacity: 0.9,
  },
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    height: screenHeight * 0.75,
    width: screenWidth - 32,
    ...theme.shadows.xl,
    overflow: 'hidden',
    position: 'absolute',
  },
  gradient: {
    bottom: 0,
    height: '50%',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  indicator: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    height: 4,
    width: 40,
  },
  infoContent: {
    gap: theme.spacing.md,
  },
  infoOverlay: {
    bottom: 0,
    left: 0,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    position: 'absolute',
    right: 0,
  },
  likeButton: {
    borderColor: theme.colors.like,
  },
  likeLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: theme.colors.like,
    borderRadius: theme.borderRadius.md,
    borderWidth: 4,
    left: 20,
    padding: theme.spacing.sm,
    position: 'absolute',
    top: 60,
    transform: [{ rotate: '-20deg' }],
  },
  likeText: {
    color: theme.colors.like,
    fontSize: 36,
    fontWeight: theme.typography.fontWeight.bold,
  },
  metricContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  metricContent: {
    alignItems: 'center',
    height: 70,
    justifyContent: 'center',
  },
  metricLabel: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.xs,
    opacity: 0.8,
  },
  metricPercentage: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  metricSvg: {
    position: 'absolute',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: theme.spacing.sm,
  },
  name: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
  },
  nameContainer: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  nopeLabel: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: theme.colors.nope,
    borderRadius: theme.borderRadius.md,
    borderWidth: 4,
    padding: theme.spacing.sm,
    position: 'absolute',
    right: 20,
    top: 60,
    transform: [{ rotate: '20deg' }],
  },
  nopeText: {
    color: theme.colors.nope,
    fontSize: 36,
    fontWeight: theme.typography.fontWeight.bold,
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
    gap: theme.spacing.xs,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: theme.spacing.md,
  },
  rejectButton: {
    borderColor: theme.colors.nope,
  },
  superLikeButton: {
    borderColor: theme.colors.superLike,
  },
  superLikeLabel: {
    alignItems: 'center',
    bottom: 100,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  superLikeText: {
    color: theme.colors.superLike,
    fontSize: 36,
    fontWeight: theme.typography.fontWeight.bold,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing.xs,
  },
});
