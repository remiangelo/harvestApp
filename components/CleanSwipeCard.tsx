import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
      } else if (shouldSwipeUp && onSuperLike) {
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
    opacity: interpolate(
      translateX.value,
      [0, 100],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const nopeOpacityStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-100, 0],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const currentPhoto = profile.photos[currentPhotoIndex];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F5E6F0', '#FCF4F9', '#FFFFFF']}
        style={styles.background}
      />

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
                style={[
                  styles.dot,
                  index === currentPhotoIndex && styles.activeDot,
                ]}
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

          {/* Bottom info */}
          <BlurView intensity={25} tint="light" style={styles.infoContainer}>
            <View style={styles.header}>
              <Text style={styles.name}>{profile.name}, {profile.age}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={14} color="#666" />
                <Text style={styles.location}>{profile.location}</Text>
              </View>
            </View>

            <Text style={styles.bio} numberOfLines={2}>
              {profile.bio}
            </Text>

            <View style={styles.tags}>
              {profile.hobbies.slice(0, 3).map((hobby, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{hobby}</Text>
                </View>
              ))}
            </View>
          </BlurView>
        </Animated.View>
      </GestureDetector>

      {/* Action buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={[styles.actionButton, styles.rewindButton]}>
          <Ionicons name="refresh" size={28} color="#FDB901" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.dislikeButton]}
          onPress={onDislike}
        >
          <Ionicons name="close" size={35} color="#FF3B30" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.superLikeButton]}
          onPress={onSuperLike}
        >
          <Ionicons name="star" size={28} color="#44BFFF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]}
          onPress={onLike}
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
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  card: {
    width: screenWidth - 20,
    height: screenHeight * 0.7,
    marginHorizontal: 10,
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 10,
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
  nopeText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  header: {
    marginBottom: 8,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  bio: {
    fontSize: 15,
    color: '#444',
    lineHeight: 20,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#A0354E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  tagText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  rewindButton: {
    width: 44,
    height: 44,
  },
  dislikeButton: {
    width: 56,
    height: 56,
  },
  superLikeButton: {
    width: 44,
    height: 44,
  },
  likeButton: {
    width: 56,
    height: 56,
  },
  boostButton: {
    width: 44,
    height: 44,
  },
});