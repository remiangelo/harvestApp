import React from 'react';
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

interface SimpleSwipeCardProps {
  profile: DemoProfile;
  onLike: () => void;
  onDislike: () => void;
  onSuperLike?: () => void;
}

export default function SimpleSwipeCard({
  profile,
  onLike,
  onDislike,
  onSuperLike,
}: SimpleSwipeCardProps) {
  const insets = useSafeAreaInsets();
  const [currentPhotoIndex, setCurrentPhotoIndex] = React.useState(0);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

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
  };

  // Simplified gesture handling without complex animations
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
        runOnJS(triggerHaptic)();
        runOnJS(onDislike)();
      } else if (shouldSwipeRight) {
        runOnJS(triggerHaptic)();
        runOnJS(onLike)();
      } else if (shouldSwipeUp && onSuperLike) {
        runOnJS(triggerHaptic)();
        runOnJS(onSuperLike)();
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

          {/* Bottom info */}
          <View style={styles.infoContainer}>
            <Text style={styles.name}>
              {profile.name} {profile.age}
            </Text>
            <Text style={styles.bio} numberOfLines={2}>
              {profile.bio}
            </Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Action buttons */}
      <View style={[styles.actionBar, { bottom: insets.bottom > 0 ? insets.bottom + 20 : 30 }]}>
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
    backgroundColor: 'white',
    borderRadius: 20,
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
  photoIndicator: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
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
    zIndex: 20,
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
    zIndex: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
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
});