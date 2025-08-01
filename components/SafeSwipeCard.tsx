import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DemoProfile } from '../data/demoProfiles';
import * as Haptics from 'expo-haptics';
import { OptimizedImage } from './OptimizedImage';
import { LiquidGlassBadge } from './liquid/LiquidGlassBadge';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;
const SWIPE_OUT_DURATION = 300;

interface SafeSwipeCardProps {
  profile: DemoProfile;
  onLike: () => void;
  onDislike: () => void;
  onSuperLike?: () => void;
}

export default function SafeSwipeCard({
  profile,
  onLike,
  onDislike,
  onSuperLike,
}: SafeSwipeCardProps) {
  const insets = useSafeAreaInsets();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Use React Native's Animated API instead of Reanimated
  const position = useRef(new Animated.ValueXY()).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const nopeOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  
  // Track if we're currently animating to prevent double triggers
  const isAnimating = useRef(false);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      // Stop all animations
      position.stopAnimation();
      likeOpacity.stopAnimation();
      nopeOpacity.stopAnimation();
      cardOpacity.stopAnimation();
    };
  }, []);

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
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const swipeComplete = (direction: 'left' | 'right' | 'up') => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    
    triggerHaptic();
    
    // Call the callback immediately instead of waiting
    if (direction === 'left') {
      onDislike();
    } else if (direction === 'right') {
      onLike();
    } else if (direction === 'up' && onSuperLike) {
      onSuperLike();
    }
    
    // Reset animation state after a delay
    animationTimeoutRef.current = setTimeout(() => {
      if (isMounted.current) {
        position.setValue({ x: 0, y: 0 });
        likeOpacity.setValue(0);
        nopeOpacity.setValue(0);
        cardOpacity.setValue(1);
        isAnimating.current = false;
        animationTimeoutRef.current = null;
      }
    }, SWIPE_OUT_DURATION);
  };

  const forceSwipe = (direction: 'right' | 'left' | 'up') => {
    try {
      if (isAnimating.current) return;
      
      const x = direction === 'right' ? screenWidth + 100 : direction === 'left' ? -screenWidth - 100 : 0;
      const y = direction === 'up' ? -screenHeight - 100 : 0;
      
      Animated.parallel([
        Animated.timing(position, {
          toValue: { x, y },
          duration: SWIPE_OUT_DURATION,
          useNativeDriver: false,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: SWIPE_OUT_DURATION,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Animation completed
        swipeComplete(direction);
      });
    } catch (error) {
      console.error('Error in forceSwipe:', error);
      // Reset state if animation fails
      isAnimating.current = false;
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimating.current,
      onPanResponderMove: (evt, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
        
        // Update like/nope opacity based on position
        likeOpacity.setValue(
          gesture.dx > 0 ? Math.min(gesture.dx / SWIPE_THRESHOLD, 1) : 0
        );
        nopeOpacity.setValue(
          gesture.dx < 0 ? Math.min(Math.abs(gesture.dx) / SWIPE_THRESHOLD, 1) : 0
        );
      },
      onPanResponderRelease: (evt, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else if (gesture.dy < -SWIPE_THRESHOLD && onSuperLike) {
          forceSwipe('up');
        } else {
          resetPosition();
          Animated.parallel([
            Animated.timing(likeOpacity, {
              toValue: 0,
              duration: 100,
              useNativeDriver: false,
            }),
            Animated.timing(nopeOpacity, {
              toValue: 0,
              duration: 100,
              useNativeDriver: false,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-screenWidth / 2, 0, screenWidth / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
      opacity: cardOpacity,
    };
  };

  const currentPhoto = profile.photos[currentPhotoIndex];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F5E6F0', '#FCF4F9', '#FFFFFF']} style={styles.background} />

      <Animated.View
        style={[styles.card, getCardStyle()]}
        {...panResponder.panHandlers}
      >
        {/* Main photo */}
        <OptimizedImage
          source={{ uri: currentPhoto }}
          style={styles.photo}
          resizeMode="cover"
          showLoadingIndicator={true}
          fallbackSource={{ uri: 'https://via.placeholder.com/400x600/A0354E/FFFFFF?text=No+Photo' }}
        />

        {/* Photo dots indicator */}
        <View style={[styles.photoIndicator, { top: insets.top + 10 }]}>
          {profile.photos.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentPhotoIndex(index)}
              style={[styles.dot, index === currentPhotoIndex && styles.activeDot]}
            />
          ))}
        </View>

        {/* Like/Nope indicators */}
        <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>

        <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
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
                <LiquidGlassBadge
                  label="Interests"
                  value="95%"
                  color="#FF6B6B"
                  variant="solid"
                />
                <LiquidGlassBadge
                  label="Personality"
                  value="98%"
                  color="#FFB901"
                  variant="solid"
                />
                <LiquidGlassBadge
                  label="Match"
                  value="96%"
                  color="#4ECDC4"
                  variant="solid"
                />
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

      {/* Action buttons */}
      <View style={[styles.actionBar, { bottom: insets.bottom > 0 ? insets.bottom + 20 : 30 }]}>
        <TouchableOpacity style={[styles.actionButton, styles.rewindButton]}>
          <Ionicons name="refresh" size={28} color="#FDB901" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.dislikeButton]} 
          onPress={() => forceSwipe('left')}
        >
          <Ionicons name="close" size={35} color="#FF3B30" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={() => forceSwipe('up')}
        >
          <Ionicons name="star" size={28} color="#44BFFF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]} 
          onPress={() => forceSwipe('right')}
        >
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