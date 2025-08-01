import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
  Image,
  ActivityIndicator,
} from 'react-native';
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
  onLike: () => void;
  onDislike: () => void;
  onSuperLike?: () => void;
}

export default function HarvestSwipeCard({
  profile,
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
    } catch {}
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

  const swipeComplete = useCallback((direction: 'left' | 'right' | 'up') => {
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
  }, [onDislike, onLike, onSuperLike, triggerHaptic]);

  const forceSwipe = useCallback((direction: 'right' | 'left' | 'up') => {
    if (isAnimating.current) return;
    
    const x = direction === 'right' ? screenWidth + 100 : direction === 'left' ? -screenWidth - 100 : 0;
    const y = direction === 'up' ? -screenHeight - 100 : 0;
    
    Animated.timing(position, {
      toValue: { x, y },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => swipeComplete(direction));
  }, [position, swipeComplete]);

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
          const nopeValue = gesture.dx < 0 ? Math.min(Math.abs(gesture.dx) / SWIPE_THRESHOLD, 1) : 0;
          const superValue = gesture.dy < -50 ? Math.min(Math.abs(gesture.dy) / SWIPE_THRESHOLD, 1) : 0;
          
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
    [position, cardScale, likeOpacity, nopeOpacity, superLikeOpacity, forceSwipe, resetPosition, triggerHaptic, onSuperLike]
  );

  const getCardStyle = useCallback(() => {
    const rotate = position.x.interpolate({
      inputRange: [-screenWidth / 2, 0, screenWidth / 2],
      outputRange: [`-${10}deg`, '0deg', `${10}deg`],
      extrapolate: 'clamp',
    });

    return {
      ...position.getLayout(),
      transform: [
        { rotate },
        { scale: cardScale },
      ],
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
      <Animated.View
        style={[styles.card, getCardStyle()]}
        {...panResponder.panHandlers}
      >
        {/* Main photo container */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: currentPhoto }}
            style={styles.photo}
            resizeMode="cover"
            onLoadStart={() => setImageLoading(true)}
            onLoadEnd={() => setImageLoading(false)}
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
                style={[
                  styles.dot,
                  index === currentPhotoIndex && styles.activeDot
                ]}
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
                <LinearGradient
                  colors={['#FF6B6B', '#FF5252']}
                  style={styles.badgeGradient}
                >
                  <Text style={styles.badgeLabel}>Interests</Text>
                  <Text style={styles.badgeValue}>95%</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.compatibilityBadge}>
                <LinearGradient
                  colors={['#FFB901', '#FFA500']}
                  style={styles.badgeGradient}
                >
                  <Text style={styles.badgeLabel}>Personality</Text>
                  <Text style={styles.badgeValue}>98%</Text>
                </LinearGradient>
              </View>
              
              <View style={styles.compatibilityBadge}>
                <LinearGradient
                  colors={['#4ECDC4', '#44A39A']}
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
  labelContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nopeLabelContainer: {
    backgroundColor: 'rgba(255, 60, 60, 0.9)',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  card: {
    position: 'absolute',
    width: screenWidth - 20,
    height: screenHeight * 0.78,
    left: 10,
    top: screenHeight * 0.1,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: '#1a1a1a',
  },
  photoContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#666',
    marginTop: 10,
    fontSize: 14,
  },
  photoNav: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '30%',
  },
  photoNavLeft: {
    left: 0,
  },
  photoNavRight: {
    right: 0,
  },
  photoIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  dot: {
    width: 30,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 3,
    borderRadius: 2,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  likeLabel: {
    position: 'absolute',
    top: 80,
    left: 20,
    zIndex: 20,
    transform: [{ rotate: '-30deg' }],
  },
  likeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4FC3A1',
    padding: 10,
    paddingHorizontal: 20,
  },
  nopeLabel: {
    position: 'absolute',
    top: 80,
    right: 20,
    zIndex: 20,
    transform: [{ rotate: '30deg' }],
  },
  nopeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF3B30',
    padding: 10,
    paddingHorizontal: 20,
  },
  superLikeLabel: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  superLikeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00C9FF',
    padding: 10,
    paddingHorizontal: 20,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: 180,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoContent: {
    padding: 20,
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  compatibilityRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  compatibilityBadge: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  badgeGradient: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  badgeLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  badgeValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  hobbiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  hobbyTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  hobbyText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  bio: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 21,
  },
  actionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  rewindButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  dislikeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  superLikeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  likeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  boostButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});