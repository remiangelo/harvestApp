import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DemoProfile } from '../data/demoProfiles';
import * as Haptics from 'expo-haptics';
import { theme } from '../constants/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.25;
const SWIPE_OUT_DURATION = 250;
const ROTATION_MULTIPLIER = 0.03;

interface HarvestSwipeCardProps {
  profile: DemoProfile;
  nextProfiles?: DemoProfile[];
  onLike: () => void;
  onDislike: () => void;
  onSuperLike?: () => void;
}

export default function HarvestSwipeCard({
  profile,
  nextProfiles = [],
  onLike,
  onDislike,
  onSuperLike,
}: HarvestSwipeCardProps) {
  const insets = useSafeAreaInsets();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const nopeOpacity = useRef(new Animated.Value(0)).current;
  const superLikeOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  // Track animation state
  const isAnimating = useRef(false);
  const isMounted = useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
      position.stopAnimation();
      likeOpacity.stopAnimation();
      nopeOpacity.stopAnimation();
      superLikeOpacity.stopAnimation();
      cardScale.stopAnimation();
    };
  }, []);

  const triggerHaptic = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.log('Haptic feedback failed:', error);
    }
  }, []);

  const resetPosition = useCallback(() => {
    Animated.parallel([
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        friction: 4,
        useNativeDriver: false,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(likeOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(nopeOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(superLikeOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [position, cardScale, likeOpacity, nopeOpacity, superLikeOpacity]);

  const swipeComplete = useCallback(
    (direction: 'left' | 'right' | 'up') => {
      if (isAnimating.current || !isMounted.current) return;
      isAnimating.current = true;

      triggerHaptic();

      setTimeout(() => {
        if (!isMounted.current) return;

        if (direction === 'left') {
          onDislike();
        } else if (direction === 'right') {
          onLike();
        } else if (direction === 'up' && onSuperLike) {
          onSuperLike();
        }

        // Reset card position after callback
        position.setValue({ x: 0, y: 0 });
        likeOpacity.setValue(0);
        nopeOpacity.setValue(0);
        superLikeOpacity.setValue(0);
        cardScale.setValue(1);
        isAnimating.current = false;
      }, SWIPE_OUT_DURATION);
    },
    [onDislike, onLike, onSuperLike, triggerHaptic]
  );

  const forceSwipe = useCallback(
    (direction: 'right' | 'left' | 'up') => {
      if (isAnimating.current) return;

      const x =
        direction === 'right' ? screenWidth + 100 : direction === 'left' ? -screenWidth - 100 : 0;
      const y = direction === 'up' ? -screenHeight - 100 : 0;

      Animated.timing(position, {
        toValue: { x, y },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: false,
      }).start(() => swipeComplete(direction));
    },
    [position, swipeComplete]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !isAnimating.current,
        onPanResponderGrant: () => {
          position.setOffset({
            x: (position.x as any)._value,
            y: (position.y as any)._value,
          });
          position.setValue({ x: 0, y: 0 });

          Animated.timing(cardScale, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: false,
          }).start();
        },
        onPanResponderMove: (_, gesture) => {
          position.setValue({ x: gesture.dx, y: gesture.dy });

          // Update label opacities
          const likeValue = gesture.dx > 0 ? Math.min(gesture.dx / SWIPE_THRESHOLD, 1) : 0;
          const nopeValue =
            gesture.dx < 0 ? Math.min(Math.abs(gesture.dx) / SWIPE_THRESHOLD, 1) : 0;
          const superValue =
            gesture.dy < -50 ? Math.min(Math.abs(gesture.dy) / SWIPE_THRESHOLD, 1) : 0;

          likeOpacity.setValue(likeValue);
          nopeOpacity.setValue(nopeValue);
          superLikeOpacity.setValue(superValue);

          // Haptic feedback at threshold
          if ((likeValue === 1 || nopeValue === 1 || superValue === 1) && !isAnimating.current) {
            triggerHaptic();
          }
        },
        onPanResponderRelease: (_, gesture) => {
          position.flattenOffset();

          if (gesture.dy < -SWIPE_THRESHOLD && onSuperLike) {
            forceSwipe('up');
          } else if (gesture.dx > SWIPE_THRESHOLD) {
            forceSwipe('right');
          } else if (gesture.dx < -SWIPE_THRESHOLD) {
            forceSwipe('left');
          } else {
            resetPosition();
          }
        },
      }),
    [
      position,
      cardScale,
      likeOpacity,
      nopeOpacity,
      superLikeOpacity,
      forceSwipe,
      resetPosition,
      triggerHaptic,
      onSuperLike,
    ]
  );

  const getCardStyle = useCallback(() => {
    const rotate = position.x.interpolate({
      inputRange: [-screenWidth / 2, 0, screenWidth / 2],
      outputRange: [`-${10}deg`, '0deg', `${10}deg`],
      extrapolate: 'clamp',
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }, { scale: cardScale }],
    };
  }, [position, cardScale]);

  const nextPhoto = useCallback(() => {
    setImageLoading(true);
    setImageError(false);
    setCurrentPhotoIndex((prev) => (prev + 1) % profile.photos.length);
  }, [profile.photos.length]);

  const prevPhoto = useCallback(() => {
    setImageLoading(true);
    setImageError(false);
    setCurrentPhotoIndex((prev) => (prev - 1 + profile.photos.length) % profile.photos.length);
  }, [profile.photos.length]);

  const currentPhoto = profile.photos[currentPhotoIndex];

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, getCardStyle()]} {...panResponder.panHandlers}>
        {/* Main photo container */}
        <View style={styles.photoContainer}>
          {/* Skeleton loader */}
          {imageLoading && (
            <View style={styles.skeletonLoader}>
              <View style={styles.skeletonImage} />
            </View>
          )}
          
          <Image
            source={{ uri: currentPhoto }}
            style={styles.photo}
            contentFit="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />

          {imageLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}

          {imageError && !imageLoading && (
            <View style={styles.errorContainer}>
              <Ionicons name="image-outline" size={48} color="#ccc" />
              <Text style={styles.errorText}>Failed to load image</Text>
            </View>
          )}

          {/* Photo navigation */}
          <TouchableOpacity
            style={[styles.photoNav, styles.photoNavLeft]}
            onPress={prevPhoto}
            activeOpacity={0.001}
          />
          <TouchableOpacity
            style={[styles.photoNav, styles.photoNavRight]}
            onPress={nextPhoto}
            activeOpacity={0.001}
          />

          {/* Photo dots indicator */}
          <View style={[styles.photoIndicator, { top: insets.top + 20 }]}>
            {profile.photos.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentPhotoIndex && styles.activeDot]}
              />
            ))}
          </View>

          {/* Swipe indicators */}
          <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
            <View style={styles.labelContainer}>
              <Text style={styles.likeText}>LIKE</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
            <View style={[styles.labelContainer, styles.nopeLabelContainer]}>
              <Text style={styles.nopeText}>NOPE</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.superLikeLabel, { opacity: superLikeOpacity }]}>
            <View style={styles.labelContainer}>
              <Text style={styles.superLikeText}>SUPER LIKE</Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom info with glass effect */}
        <View style={styles.infoContainer}>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFillObject}>
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
                {profile.name}, {profile.age}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.location}>{profile.location}</Text>
              </View>
            </View>

            {/* Compatibility badges */}
            <View style={styles.compatibilityRow}>
              <View style={styles.compatibilityBadge}>
                <LinearGradient colors={['#FF6B6B', '#FF5252']} style={styles.badgeGradient}>
                  <Text style={styles.badgeLabel}>Interests</Text>
                  <Text style={styles.badgeValue}>95%</Text>
                </LinearGradient>
              </View>

              <View style={styles.compatibilityBadge}>
                <LinearGradient colors={['#FFB901', '#FFA500']} style={styles.badgeGradient}>
                  <Text style={styles.badgeLabel}>Personality</Text>
                  <Text style={styles.badgeValue}>98%</Text>
                </LinearGradient>
              </View>

              <View style={styles.compatibilityBadge}>
                <LinearGradient colors={['#4ECDC4', '#44A39A']} style={styles.badgeGradient}>
                  <Text style={styles.badgeLabel}>Overall</Text>
                  <Text style={styles.badgeValue}>96%</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Hobbies */}
            <View style={styles.hobbiesRow}>
              {profile.hobbies.slice(0, 4).map((hobby, index) => (
                <View key={index} style={styles.hobbyTag}>
                  <Text style={styles.hobbyText}>{hobby}</Text>
                </View>
              ))}
            </View>

            {/* Bio */}
            <Text style={styles.bio} numberOfLines={3}>
              {profile.bio}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Action buttons */}
      <View style={[styles.actionBar, { bottom: insets.bottom + 30 }]}>
        <TouchableOpacity style={[styles.actionButton, styles.rewindButton]}>
          <Ionicons name="refresh" size={28} color="#FDB901" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={() => forceSwipe('left')}
        >
          <Ionicons name="close" size={40} color="#FF3B30" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => onSuperLike && forceSwipe('up')}
        >
          <Ionicons name="star" size={28} color="#00C9FF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => forceSwipe('right')}
        >
          <Ionicons name="heart" size={35} color="#4FC3A1" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.boostButton]}>
          <Ionicons name="flash" size={28} color="#9C27B0" />
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
    borderWidth: 1,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  badgeGradient: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '600',
  },
  badgeValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  bio: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 21,
  },
  boostButton: {
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    elevation: 10,
    height: screenHeight * 0.78,
    left: 10,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    top: screenHeight * 0.1,
    width: screenWidth - 20,
  },
  compatibilityBadge: {
    borderRadius: 12,
    flex: 1,
    overflow: 'hidden',
  },
  compatibilityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  dislikeButton: {
    borderRadius: 35,
    height: 70,
    width: 70,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    height: 3,
    marginHorizontal: 3,
    width: 30,
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    marginTop: 10,
  },
  header: {
    marginBottom: 12,
  },
  hobbiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  hobbyTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hobbyText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    bottom: 0,
    left: 0,
    minHeight: 180,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
  },
  infoContent: {
    padding: 20,
  },
  labelContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
    borderWidth: 3,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  likeButton: {
    borderRadius: 35,
    height: 70,
    width: 70,
  },
  likeLabel: {
    left: 20,
    position: 'absolute',
    top: 80,
    transform: [{ rotate: '-30deg' }],
    zIndex: 20,
  },
  likeText: {
    color: '#4FC3A1',
    fontSize: 32,
    fontWeight: 'bold',
    padding: 10,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  location: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginLeft: 4,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  name: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nopeLabel: {
    position: 'absolute',
    right: 20,
    top: 80,
    transform: [{ rotate: '30deg' }],
    zIndex: 20,
  },
  nopeLabelContainer: {
    backgroundColor: 'rgba(255, 60, 60, 0.9)',
  },
  nopeText: {
    color: '#FF3B30',
    fontSize: 32,
    fontWeight: 'bold',
    padding: 10,
    paddingHorizontal: 20,
  },
  photo: {
    height: '100%',
    width: '100%',
  },
  photoContainer: {
    borderRadius: 20,
    flex: 1,
    overflow: 'hidden',
  },
  photoIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 20,
    position: 'absolute',
    right: 0,
    zIndex: 10,
  },
  photoNav: {
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: '30%',
  },
  photoNavLeft: {
    left: 0,
  },
  photoNavRight: {
    right: 0,
  },
  rewindButton: {
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  superLikeButton: {
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  superLikeLabel: {
    alignItems: 'center',
    bottom: 160,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 20,
  },
  superLikeText: {
    color: '#00C9FF',
    fontSize: 32,
    fontWeight: 'bold',
    padding: 10,
    paddingHorizontal: 20,
  },
  skeletonLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#333',
    borderRadius: 20,
    overflow: 'hidden',
  },
  skeletonImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#444',
  },
});
