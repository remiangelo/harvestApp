import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Feature {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    id: 'profiles',
    icon: 'person-circle-outline',
    iconColor: theme.colors.primary,
    iconBackground: theme.colors.primarySoft,
    title: 'Purposeful Profiles',
    description:
      'Profiles are encouraged to support real connection, with clear face photos and without explicit, aggressive, or unsafe content.',
  },
  {
    id: 'values',
    icon: 'heart-outline',
    iconColor: theme.colors.accent,
    iconBackground: theme.colors.accentSoft,
    title: 'Values-Based Matching',
    description:
      'Harvest matches you on values and relationship priorities, not just photos or hobbies, helping meaningful, emotionally aligned connections form.',
  },
  {
    id: 'messaging',
    icon: 'shield-checkmark-outline',
    iconColor: '#3B82F6',
    iconBackground: 'rgba(59, 130, 246, 0.15)',
    title: 'Mindful Messaging & Dating Safety',
    description:
      'Mindful messaging encourages respectful conversation and helps surface meaningful connection, with gentle safeguards that identify inappropriate or harmful content early.',
  },
  {
    id: 'gardener',
    icon: 'leaf-outline',
    iconColor: theme.colors.accent,
    iconBackground: theme.colors.accentSoft,
    title: 'The Gardener',
    description:
      'The Gardener helps you talk through messages and patterns, offering perspective so you can make clearer, more intentional dating choices.',
  },
];

export default function OnboardingFeatures() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const handleContinue = () => {
    if (activeIndex < FEATURES.length - 1) {
      // Scroll to next slide
      scrollViewRef.current?.scrollTo({
        x: (activeIndex + 1) * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      // Go to age verification (first onboarding step)
      router.replace('/onboarding/age');
    }
  };

  const handleSkip = () => {
    router.replace('/onboarding/age');
  };

  const isLastSlide = activeIndex === FEATURES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Features carousel */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {FEATURES.map((feature, index) => (
          <View key={feature.id} style={styles.slide}>
            <View style={styles.slideContent}>
              {/* Icon */}
              <View style={[styles.iconContainer, { backgroundColor: feature.iconBackground }]}>
                <Ionicons name={feature.icon} size={64} color={feature.iconColor} />
              </View>

              {/* Title */}
              <Text style={styles.title}>{feature.title}</Text>

              {/* Description */}
              <Text style={styles.description}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      <View style={styles.pagination}>
        {FEATURES.map((_, idx) => (
          <View
            key={idx}
            style={[styles.dot, idx === activeIndex ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      {/* Continue button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>{isLastSlide ? 'Get Started' : 'Continue'}</Text>
          <Ionicons
            name={isLastSlide ? 'arrow-forward' : 'chevron-forward'}
            size={20}
            color="#fff"
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    width: '100%',
    ...theme.shadows.md,
  },
  buttonContainer: {
    paddingBottom: 24,
    paddingHorizontal: 24,
    width: '100%',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 18,
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  description: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
  dot: {
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  dotInactive: {
    backgroundColor: theme.colors.border,
    width: 8,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 40,
    height: 120,
    justifyContent: 'center',
    marginBottom: 32,
    width: 120,
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  scrollView: {
    flex: 1,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 16,
    paddingRight: 24,
  },
  skipText: {
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 16,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 340,
    paddingHorizontal: 24,
  },
  title: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.display,
    fontSize: 28,
    textAlign: 'center',
  },
});
