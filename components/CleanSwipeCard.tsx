import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

interface CleanSwipeCardProps {
  profile: DemoProfile;
  onLike: () => void;
  onDislike: () => void;
  onSuperLike?: () => void;
}

export default function CleanSwipeCard({
  profile,
  onLike,
  onDislike,
  onSuperLike,
}: CleanSwipeCardProps) {
  const insets = useSafeAreaInsets();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Safety check
  if (!profile || !profile.photos || profile.photos.length === 0) {
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

  const handleSwipeComplete = (direction: 'left' | 'right' | 'up') => {
    'worklet';
    runOnJS(() => {
      try {
        triggerHaptic();

        // Reset animation values immediately
        translateX.value = 0;
        translateY.value = 0;
        scale.value = 1;
        opacity.value = 1;

        // Call the appropriate handler after a small delay
        setTimeout(() => {
          if (direction === 'left') {
            onDislike();
          } else if (direction === 'right') {
            onLike();
          } else if (direction === 'up' && onSuperLike) {
            onSuperLike();
          }
        }, 50);
      } catch (error) {
        console.error('Error in handleSwipeComplete:', error);
      }
    })();
  };

  const panGesture = Gesture.Pan()
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
        opacity.value = withTiming(0, { duration: 300 });
        runOnJS(() => {
          setTimeout(() => handleSwipeComplete('left'), 300);
        })();
      } else if (shouldSwipeRight) {
        translateX.value = withTiming(screenWidth * 1.5, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        runOnJS(() => {
          setTimeout(() => handleSwipeComplete('right'), 300);
        })();
      } else if (shouldSwipeUp && onSuperLike) {
        translateY.value = withTiming(-screenHeight, { duration: 300 });
        opacity.value = withTiming(0, { duration: 300 });
        runOnJS(() => {
          setTimeout(() => handleSwipeComplete('up'), 300);
        })();
      } else {
        resetPosition();
      }
    });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-screenWidth / 2, 0, screenWidth / 2],
      [-10, 0, 10],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const likeOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 100], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-100, 0], [1, 0], Extrapolation.CLAMP),
  }));

  const currentPhoto = profile.photos[currentPhotoIndex];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F5E6F0', '#FCF4F9', '#FFFFFF']} style={styles.background} />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
          {/* Main photo */}
          <OptimizedImage
            source={{ uri: currentPhoto }}
            style={styles.photo}
            resizeMode="cover"
            showLoadingIndicator={true}
          />

          {/* Photo dots indicator */}
          <View style={styles.photoIndicator}>
            {profile.photos.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentPhotoIndex(index)}
                style={[styles.dot, index === currentPhotoIndex && styles.activeDot]}
              />
            ))}
          </View>

          {/* Like/Nope indicators */}
          <Animated.View style={[styles.likeLabel, likeOpacityStyle]}>
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>

          <Animated.View style={[styles.nopeLabel, nopeOpacityStyle]}>
            <Text style={styles.nopeText}>NOPE</Text>
          </Animated.View>

          {/* Bottom info - Liquid Glass */}
          <View style={styles.infoContainer}>
            <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFillObject}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            </BlurView>

            <View style={styles.infoContent}>
              <View style={styles.header}>
                <Text style={styles.name}>
                  {profile.name} {profile.age}
                </Text>

                {/* Compatibility metrics */}
                <View style={styles.metricsRow}>
                  <View style={styles.metric}>
                    <View style={[styles.metricCircle, { borderColor: '#FF6B6B' }]}>
                      <Text style={styles.metricText}>95%</Text>
                    </View>
                    <Text style={styles.metricLabel}>Interests</Text>
                  </View>

                  <View style={styles.metric}>
                    <View style={[styles.metricCircle, { borderColor: '#FFB901' }]}>
                      <Text style={styles.metricText}>98%</Text>
                    </View>
                    <Text style={styles.metricLabel}>Personality</Text>
                  </View>

                  <View style={styles.metric}>
                    <View style={[styles.metricCircle, { borderColor: '#4ECDC4' }]}>
                      <Text style={styles.metricText}>96%</Text>
                    </View>
                    <Text style={styles.metricLabel}>Match</Text>
                  </View>
                </View>
              </View>

              <View style={styles.tags}>
                {['#nature', '#books', '#travel', '#movies', '#filmmaking'].map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.bio} numberOfLines={3}>
                {profile.bio}
              </Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Action buttons */}
      <View style={[styles.actionBar, { bottom: insets.bottom > 0 ? insets.bottom + 20 : 30 }]}>
        <TouchableOpacity style={[styles.actionButton, styles.rewindButton]}>
          <Ionicons name="refresh" size={28} color="#FDB901" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.dislikeButton]} onPress={onDislike}>
          <Ionicons name="close" size={35} color="#FF3B30" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={onSuperLike}
        >
          <Ionicons name="star" size={28} color="#44BFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={onLike}>
          <Ionicons name="heart" size={30} color="#34C759" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.boostButton]}>
          <Ionicons name="flash" size={28} color="#8E5AF7" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    elevation: 3,
    height: 50,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: 50,
  },
  activeDot: {
    backgroundColor: 'white',
  },
  background: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  bio: {
    color: '#333',
    fontSize: 14,
    lineHeight: 18,
    marginTop: 10,
  },
  boostButton: {
    height: 44,
    width: 44,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 5,
    height: screenHeight * 0.7,
    marginHorizontal: 10,
    marginTop: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: screenWidth - 20,
  },
  container: {
    flex: 1,
  },
  dislikeButton: {
    height: 56,
    width: 56,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
    height: 4,
    marginHorizontal: 2,
    width: 30,
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  errorText: {
    color: '#999',
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    marginBottom: 12,
  },
  infoContainer: {
    bottom: 0,
    height: 180,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
  },
  infoContent: {
    flex: 1,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  likeButton: {
    height: 56,
    width: 56,
  },
  likeLabel: {
    backgroundColor: 'rgba(52, 199, 89, 0.9)',
    borderRadius: 10,
    left: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    position: 'absolute',
    top: 60,
    transform: [{ rotate: '-20deg' }],
    zIndex: 20,
  },
  likeText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  location: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  metric: {
    alignItems: 'center',
  },
  metricCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    marginBottom: 4,
    width: 40,
  },
  metricLabel: {
    color: '#666',
    fontSize: 11,
  },
  metricText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  name: {
    color: '#1a1a1a',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  nopeLabel: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    position: 'absolute',
    right: 20,
    top: 60,
    transform: [{ rotate: '20deg' }],
    zIndex: 20,
  },
  nopeText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  photo: {
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  photoIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
    top: 20,
    zIndex: 10,
  },
  rewindButton: {
    height: 44,
    width: 44,
  },
  superLikeButton: {
    height: 44,
    width: 44,
  },
  tag: {
    backgroundColor: '#A0354E',
    borderRadius: 12,
    marginBottom: 6,
    marginRight: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
});
