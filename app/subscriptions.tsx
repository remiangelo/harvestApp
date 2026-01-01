import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';

type PlanType = 'free' | 'premium' | 'gold';

interface Feature {
  text: string;
  included: boolean;
}

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  features: Feature[];
  gradient: string[];
  icon: keyof typeof Ionicons.glyphMap;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'Forever',
    icon: 'leaf-outline',
    features: [
      { text: 'Unlimited swipes', included: true },
      { text: 'Basic filters (age, distance, gender)', included: true },
      { text: 'Real-time messaging', included: true },
      { text: '5 Gardener AI chats/month', included: true },
      { text: 'Mindful Messaging feature', included: true },
    ],
    gradient: ['#6B7280', '#4B5563'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$9.99',
    period: '/month',
    popular: true,
    icon: 'heart',
    features: [
      { text: 'Everything in Free', included: true },
      { text: '20 Gardener AI chats/month', included: true },
      { text: 'Advanced filters', included: true },
      { text: 'See who liked you', included: true },
      { text: 'Rewind last swipe', included: true },
      { text: 'No ads', included: true },
    ],
    gradient: [theme.colors.primary, theme.colors.primaryDark],
  },
  {
    id: 'gold',
    name: 'Gold',
    price: '$19.99',
    period: '/month',
    icon: 'diamond',
    features: [
      { text: 'Everything in Premium', included: true },
      { text: 'Unlimited Gardener AI chats', included: true },
      { text: 'Priority profile visibility', included: true },
      { text: 'Advanced AI safety features', included: true },
      { text: 'Exclusive Gold badge', included: true },
      { text: 'Early access to new features', included: true },
    ],
    gradient: ['#F59E0B', '#D97706'],
  },
];

export default function SubscriptionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [,] = useState<PlanType>('free'); // Currently unused but kept for future functionality
  const [currentPlan] = useState<PlanType>('free'); // User's current plan

  const handleSubscribe = (planId: PlanType) => {
    if (planId === 'free') {
      Alert.alert('Free Plan', 'You are already on the free plan!');
      return;
    }

    Alert.alert(
      'Subscribe to ' + plans.find((p) => p.id === planId)?.name,
      'This will redirect you to the payment screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // TODO: Implement payment flow
            Alert.alert('Coming Soon', 'Payment integration will be available soon!');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={[styles.header, { paddingTop: insets.top + 10 }]} // Add extra padding to ensure full coverage
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <Text style={styles.headerSubtitle}>Unlock premium features for better matches</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Current Plan Badge */}
        {currentPlan !== 'free' && (
          <View style={styles.currentPlanBadge}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
            <Text style={styles.currentPlanText}>
              Current Plan: {plans.find((p) => p.id === currentPlan)?.name}
            </Text>
          </View>
        )}

        {/* Plans */}
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            activeOpacity={0.9}
            style={[styles.planContainer, plan.popular && styles.planContainerPopular]}
            onPress={() => handleSubscribe(plan.id)}
          >
            <View style={[styles.planCard, plan.popular && styles.planCardPopular]}>
              {plan.popular && (
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.popularBadge}
                >
                  <Ionicons name="star" size={12} color="white" />
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </LinearGradient>
              )}

              <LinearGradient
                colors={plan.gradient as [string, string]}
                style={[styles.planHeader, plan.popular && styles.planHeaderPopular]}
              >
                <View style={styles.planIconContainer}>
                  <Ionicons name={plan.icon} size={28} color="white" />
                </View>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{plan.price}</Text>
                  <Text style={styles.period}>{plan.period}</Text>
                </View>
              </LinearGradient>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <View
                      style={[
                        styles.featureIconContainer,
                        {
                          backgroundColor: feature.included
                            ? `${theme.colors.primary}15`
                            : '#f5f5f5',
                        },
                      ]}
                    >
                      <Ionicons
                        name={feature.included ? 'checkmark' : 'close'}
                        size={14}
                        color={feature.included ? theme.colors.primary : '#999'}
                      />
                    </View>
                    <Text
                      style={[styles.featureText, !feature.included && styles.featureTextDisabled]}
                    >
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              {currentPlan === plan.id ? (
                <View style={styles.currentIndicator}>
                  <Ionicons name="checkmark-circle" size={18} color="white" />
                  <Text style={styles.currentText}>Current Plan</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={plan.gradient as [string, string]}
                  style={styles.subscribeButton}
                >
                  <Text style={styles.subscribeText}>
                    {plan.id === 'free' ? 'Select Free' : `Get ${plan.name}`}
                  </Text>
                </LinearGradient>
              )}
            </View>
          </TouchableOpacity>
        ))}

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Why Go Premium?</Text>

          <View style={styles.benefitCard}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.benefitIcon}
            >
              <Ionicons name="leaf" size={24} color="white" />
            </LinearGradient>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Unlimited AI Dating Coach</Text>
              <Text style={styles.benefitDescription}>
                Get personalized advice from The Gardener whenever you need it
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <LinearGradient colors={[theme.colors.primary, '#45a049']} style={styles.benefitIcon}>
              <Ionicons name="shield-checkmark" size={24} color="white" />
            </LinearGradient>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Advanced Safety Features</Text>
              <Text style={styles.benefitDescription}>
                Enhanced AI protection for mindful, meaningful conversations
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <LinearGradient colors={[theme.colors.primary, '#1976D2']} style={styles.benefitIcon}>
              <Ionicons name="eye" size={24} color="white" />
            </LinearGradient>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>See Who Likes You</Text>
              <Text style={styles.benefitDescription}>
                Save time by connecting with people already interested in you
              </Text>
            </View>
          </View>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          Subscriptions automatically renew unless cancelled at least 24 hours before the end of the
          current period. Manage subscriptions in your device settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 20,
    marginTop: 10,
  },
  benefitCard: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  benefitContent: {
    flex: 1,
    marginLeft: 15,
  },
  benefitDescription: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    marginTop: 2,
  },
  benefitIcon: {
    alignItems: 'center',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  benefitTitle: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsSection: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  benefitsTitle: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  container: {
    backgroundColor: '#f8f9fa',
    flex: 1,
  },
  currentIndicator: {
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  currentPlanBadge: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    flexDirection: 'row',
    marginBottom: 20,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  currentPlanText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  currentText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  featureIconContainer: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  featureText: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  featureTextDisabled: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  featuresContainer: {
    backgroundColor: 'white',
    paddingBottom: 8,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingHorizontal: 20,
    paddingTop: 0, // Ensure it starts at the absolute top
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  period: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  planCardPopular: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  planContainer: {
    marginBottom: 16,
    marginHorizontal: 20,
  },
  planContainerPopular: {
    marginBottom: 20,
    transform: [{ scale: 1.02 }],
  },
  planHeader: {
    alignItems: 'center',
    paddingBottom: 24,
    paddingTop: 24,
  },
  planHeaderPopular: {
    paddingTop: 36,
  },
  planIconContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    height: 56,
    justifyContent: 'center',
    marginBottom: 12,
    width: 56,
  },
  planName: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  popularBadge: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
    zIndex: 1,
  },
  popularText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  price: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  priceContainer: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
  scrollContent: {
    paddingBottom: 96, // Account for tab bar (56px) + extra margin (40px)
    paddingTop: 20,
  },
  subscribeButton: {
    alignItems: 'center',
    borderRadius: 25,
    marginBottom: 20,
    marginHorizontal: 20,
    paddingVertical: 14,
  },
  subscribeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    color: theme.colors.primary,
    fontSize: 12,
    marginHorizontal: 20,
    marginTop: 30,
    textAlign: 'center',
  },
});
