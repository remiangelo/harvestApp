import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DemoProfile } from '../data/demoProfiles';
import * as Haptics from 'expo-haptics';
import { theme } from '../constants/theme';
const SWIPE_OUT_DURATION = 250;
const FALLBACK_IMAGE = 'https://via.placeholder.com/800x1200/A0354E/FFFFFF?text=No+Image';

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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const SWIPE_THRESHOLD = screenWidth * 0.25;

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const nopeOpacity = useRef(new Animated.Value(0)).current;
  const topPickOpacity = useRef(new Animated.Value(0)).current;
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
      topPickOpacity.stopAnimation();
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
        useNativeDriver: false,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        useNativeDriver: false,
      }),
      Animated.timing(likeOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(nopeOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(topPickOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [position, cardScale, likeOpacity, nopeOpacity, topPickOpacity]);

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
        topPickOpacity.setValue(0);
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
        onMoveShouldSetPanResponder: (_, gesture) => {
          // Only respond if the gesture is predominantly horizontal
          // This allows vertical scrolling without triggering swipes
          const isHorizontalSwipe = Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5;
          const isStrongUpwardSwipe = gesture.dy < -80 && Math.abs(gesture.dx) < 50;

          return !isAnimating.current && (isHorizontalSwipe || isStrongUpwardSwipe);
        },
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
          // Only set position for horizontal movement or strong upward swipe
          const isHorizontalSwipe = Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5;
          const isStrongUpwardSwipe = gesture.dy < -80;

          if (isHorizontalSwipe) {
            // Horizontal swipe - allow left/right
            position.setValue({ x: gesture.dx, y: 0 });

            const likeValue = gesture.dx > 0 ? Math.min(gesture.dx / SWIPE_THRESHOLD, 1) : 0;
            const nopeValue =
              gesture.dx < 0 ? Math.min(Math.abs(gesture.dx) / SWIPE_THRESHOLD, 1) : 0;

            likeOpacity.setValue(likeValue);
            nopeOpacity.setValue(nopeValue);
            topPickOpacity.setValue(0);

            if ((likeValue === 1 || nopeValue === 1) && !isAnimating.current) {
              triggerHaptic();
            }
          } else if (isStrongUpwardSwipe && onSuperLike) {
            // Strong upward swipe for top pick
            position.setValue({ x: 0, y: gesture.dy });
            const topPickValue = Math.min(Math.abs(gesture.dy) / SWIPE_THRESHOLD, 1);
            topPickOpacity.setValue(topPickValue);
            likeOpacity.setValue(0);
            nopeOpacity.setValue(0);

            if (topPickValue === 1 && !isAnimating.current) {
              triggerHaptic();
            }
          }
        },
        onPanResponderRelease: (_, gesture) => {
          position.flattenOffset();

          const isHorizontalSwipe = Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5;
          const isStrongUpwardSwipe =
            gesture.dy < -SWIPE_THRESHOLD * 1.2 && Math.abs(gesture.dx) < 50;

          if (isStrongUpwardSwipe && onSuperLike) {
            forceSwipe('up');
          } else if (isHorizontalSwipe && gesture.dx > SWIPE_THRESHOLD) {
            forceSwipe('right');
          } else if (isHorizontalSwipe && gesture.dx < -SWIPE_THRESHOLD) {
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
      topPickOpacity,
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
      {/* Fullscreen card */}
      <Animated.View style={[styles.card, getCardStyle()]} {...panResponder.panHandlers}>
        {/* Main photo container - now fullscreen */}
        <View style={styles.photoContainer}>
          {/* Skeleton loader */}
          {imageLoading && (
            <View style={styles.skeletonLoader}>
              <View style={styles.skeletonImage} />
            </View>
          )}

          <Image
            source={{ uri: currentPhoto || FALLBACK_IMAGE }}
            style={styles.photo}
            contentFit="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoad={() => setImageLoading(false)}
            onError={(error) => {
              console.log('Image load error:', error);
              setImageError(true);
              setImageLoading(false);
            }}
            placeholder={{ uri: FALLBACK_IMAGE }}
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

          {/* Photo navigation - invisible touch areas */}
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

          {/* Photo dots indicator - positioned at top */}
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

          <Animated.View style={[styles.topPickLabel, { opacity: topPickOpacity }]}>
            <View style={styles.labelContainer}>
              <Text style={styles.topPickText}>TOP PICK</Text>
            </View>
          </Animated.View>

          {/* Side gradient indicators - visible in middle 30% of screen */}
          <View style={styles.leftGradientContainer}>
            <LinearGradient
              colors={['rgba(220, 38, 38, 0.18)', 'rgba(220, 38, 38, 0.06)', 'transparent']}
              locations={[0, 0.15, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.leftGradientBar}
            />
            <LinearGradient
              colors={['transparent', 'rgba(220, 38, 38, 0.08)', 'transparent']}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0.35 }}
              end={{ x: 0, y: 0.65 }}
              style={styles.leftGradientVertical}
            />
          </View>
          <View style={styles.rightGradientContainer}>
            <LinearGradient
              colors={['transparent', 'rgba(16, 185, 129, 0.06)', 'rgba(16, 185, 129, 0.18)']}
              locations={[0, 0.85, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.rightGradientBar}
            />
            <LinearGradient
              colors={['transparent', 'rgba(16, 185, 129, 0.08)', 'transparent']}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0.35 }}
              end={{ x: 0, y: 0.65 }}
              style={styles.rightGradientVertical}
            />
          </View>

          {/* Bottom gradient overlay for info */}
          <LinearGradient
            colors={[
              'transparent',
              'rgba(0,0,0,0.3)',
              'rgba(0,0,0,0.6)',
              'rgba(0,0,0,0.85)',
              'rgba(0,0,0,0.95)',
            ]}
            locations={[0, 0.4, 0.6, 0.8, 1]}
            style={[
              styles.bottomGradient,
              {
                paddingBottom:
                  Platform.OS === 'android'
                    ? Math.max(insets.bottom + 56 + 20, 100)
                    : Math.max(insets.bottom + 56 + 30, 120),
              },
            ]}
          >
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

              {/* Compatibility badges - maroon theme variants */}
              <View style={styles.compatibilityRow}>
                <View style={styles.compatibilityBadge}>
                  <LinearGradient
                    colors={['rgba(160, 53, 78, 0.9)', 'rgba(139, 46, 67, 0.85)']}
                    style={styles.badgeGradient}
                  >
                    <Text style={styles.badgeLabel}>Interests</Text>
                    <Text style={styles.badgeValue}>95%</Text>
                  </LinearGradient>
                </View>

                <View style={styles.compatibilityBadge}>
                  <LinearGradient
                    colors={['rgba(196, 86, 107, 0.9)', 'rgba(184, 149, 106, 0.85)']}
                    style={styles.badgeGradient}
                  >
                    <Text style={styles.badgeLabel}>Personality</Text>
                    <Text style={styles.badgeValue}>98%</Text>
                  </LinearGradient>
                </View>

                <View style={styles.compatibilityBadge}>
                  <LinearGradient
                    colors={['rgba(122, 155, 142, 0.9)', 'rgba(212, 115, 138, 0.85)']}
                    style={styles.badgeGradient}
                  >
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
              {profile.bio && (
                <Text style={styles.bio} numberOfLines={2}>
                  {profile.bio}
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badgeValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  bio: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    lineHeight: 21,
  },
  bottomGradient: {
    bottom: 0,
    left: 0,
    minHeight: 280,
    paddingTop: 60,
    position: 'absolute',
    right: 0,
  },
  card: {
    height: Dimensions.get('window').height,
    left: 0,
    position: 'absolute',
    top: 0,
    width: Dimensions.get('window').width,
  },
  compatibilityBadge: {
    borderRadius: 12,
    elevation: 5,
    flex: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  compatibilityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  dot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
    height: 3,
    marginHorizontal: 3,
    width: 30,
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    marginTop: 10,
  },
  header: {
    marginBottom: 10,
  },
  hobbiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  hobbyTag: {
    backgroundColor: 'rgba(160, 53, 78, 0.15)',
    borderColor: 'rgba(160, 53, 78, 0.25)',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hobbyText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
    fontWeight: '600',
  },
  infoContent: {
    paddingHorizontal: 20,
  },
  labelContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
    borderWidth: 3,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  leftGradientBar: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  leftGradientContainer: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    width: 80,
    zIndex: 5,
  },
  leftGradientVertical: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
  likeLabel: {
    left: 20,
    position: 'absolute',
    top: '40%',
    transform: [{ rotate: '-30deg' }],
    zIndex: 20,
  },
  likeText: {
    color: '#4FC3A1',
    fontSize: 32,
    fontWeight: 'bold',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
  },
  location: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginLeft: 4,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  name: {
    color: '#fff',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  nopeLabel: {
    position: 'absolute',
    right: 20,
    top: '40%',
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
  },
  photo: {
    height: '100%',
    width: '100%',
  },
  photoContainer: {
    backgroundColor: '#000',
    flex: 1,
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
  rightGradientBar: {
    bottom: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  rightGradientContainer: {
    bottom: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 80,
    zIndex: 5,
  },
  rightGradientVertical: {
    bottom: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  skeletonImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#444',
  },
  skeletonLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#333',
    overflow: 'hidden',
  },
  topPickLabel: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: '35%',
    zIndex: 20,
  },
  topPickText: {
    color: '#00C9FF',
    fontSize: 32,
    fontWeight: 'bold',
  },
});
