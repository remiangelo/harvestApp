import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { LiquidGlassView } from '../components/liquid/LiquidGlassView';

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
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Harvest Free',
    price: '$0',
    period: 'Forever',
    features: [
      { text: '10 likes per day', included: true },
      { text: '3 Super Likes per day', included: true },
      { text: 'Basic filters', included: true },
      { text: 'Standard matching', included: true },
      { text: 'Unlimited likes', included: false },
      { text: 'See who liked you', included: false },
      { text: 'Rewind last swipe', included: false },
      { text: 'Priority support', included: false },
    ],
    gradient: [theme.colors.primary, '#999'],
  },
  {
    id: 'premium',
    name: 'Harvest Premium',
    price: '$14.99',
    period: '/month',
    popular: true,
    features: [
      { text: 'Unlimited likes', included: true },
      { text: '5 Super Likes per day', included: true },
      { text: 'Advanced filters', included: true },
      { text: 'See who liked you', included: true },
      { text: 'Rewind last swipe', included: true },
      { text: 'Priority in match queue', included: true },
      { text: 'Read receipts', included: true },
      { text: 'Message before matching', included: false },
    ],
    gradient: [theme.colors.primary, theme.colors.primaryDark],
  },
  {
    id: 'gold',
    name: 'Harvest Gold',
    price: '$24.99',
    period: '/month',
    features: [
      { text: 'Everything in Premium', included: true },
      { text: '10 Super Likes per day', included: true },
      { text: 'Boost profile monthly', included: true },
      { text: 'Message before matching (2/day)', included: true },
      { text: 'Advanced AI matchmaking', included: true },
      { text: 'Exclusive Gold badge', included: true },
      { text: 'Priority support', included: true },
      { text: 'Early access to features', included: true },
    ],
    gradient: [theme.colors.primary, '#FFA500'],
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
          <TouchableOpacity key={plan.id} activeOpacity={0.9} style={styles.planContainer}>
            <LiquidGlassView
              intensity={65}
              tint="light"
              style={styles.planCard as any}
              borderRadius={20}
              glassTint="rgba(255, 255, 255, 0.92)"
            >
              {plan.popular && (
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.popularBadge}
                >
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </LinearGradient>
              )}

              <LinearGradient colors={plan.gradient as any} style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{plan.price}</Text>
                  <Text style={styles.period}>{plan.period}</Text>
                </View>
              </LinearGradient>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons
                      name={feature.included ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={feature.included ? theme.colors.primary : '#999'}
                    />
                    <Text
                      style={[styles.featureText, !feature.included && styles.featureTextDisabled]}
                    >
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              {currentPlan !== plan.id && (
                <TouchableOpacity
                  style={styles.subscribeButton}
                  onPress={() => handleSubscribe(plan.id)}
                >
                  <LinearGradient
                    colors={
                      (plan.id === 'free' ? [theme.colors.primary, '#666'] : plan.gradient) as any
                    }
                    style={styles.subscribeGradient}
                  >
                    <Text style={styles.subscribeText}>
                      {plan.id === 'free' ? 'Downgrade' : 'Subscribe'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {currentPlan === plan.id && (
                <View style={styles.currentIndicator}>
                  <Text style={styles.currentText}>Your Current Plan</Text>
                </View>
              )}
            </LiquidGlassView>
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
              <Ionicons name="heart" size={24} color="white" />
            </LinearGradient>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>3x More Matches</Text>
              <Text style={styles.benefitDescription}>
                Premium members get 3 times more matches on average
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <LinearGradient colors={[theme.colors.primary, '#45a049']} style={styles.benefitIcon}>
              <Ionicons name="eye" size={24} color="white" />
            </LinearGradient>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>See Who Likes You</Text>
              <Text style={styles.benefitDescription}>
                Save time by seeing who already likes you
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <LinearGradient colors={[theme.colors.primary, '#1976D2']} style={styles.benefitIcon}>
              <Ionicons name="flash" size={24} color="white" />
            </LinearGradient>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Priority Visibility</Text>
              <Text style={styles.benefitDescription}>Be seen by more potential matches</Text>
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
    backgroundColor: theme.colors.primary,
    flex: 1,
  },
  currentIndicator: {
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
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
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  featureText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    marginLeft: 10,
  },
  featureTextDisabled: {
    color: theme.colors.primary,
    textDecorationLine: 'line-through',
  },
  featuresContainer: {
    padding: 20,
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
    overflow: 'hidden',
  },
  planContainer: {
    marginBottom: 20,
    marginHorizontal: 20,
  },
  planHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  planName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  popularBadge: {
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 5,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
    zIndex: 1,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
    borderRadius: 25,
    marginBottom: 20,
    marginHorizontal: 20,
    marginTop: 10,
    overflow: 'hidden',
  },
  subscribeGradient: {
    alignItems: 'center',
    paddingVertical: 12,
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
