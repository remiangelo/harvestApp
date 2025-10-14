import React, { useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { LiquidGlassView } from '../components/liquid/LiquidGlassView';
import { theme } from '../constants/theme';
import { useAuthStore } from '../stores/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export default function AuthScreen() {
  const router = useRouter();
  const { loginWithOAuth } = useAuthStore();

  // Memoize decoration positions to prevent recalculation on every render
  const decorations = useMemo(
    () =>
      [...Array(8)].map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        rotation: `${Math.random() * 360}deg`,
      })),
    []
  );

  return (
    <LinearGradient colors={['#FFFFFF', '#FFF5F7', '#FFE5EA']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <LiquidGlassView
              intensity={70}
              tint="light"
              style={styles.logo}
              borderRadius={50}
              glassTint="rgba(255, 255, 255, 0.95)"
            >
              <View style={{ zIndex: 10 }}>
                <Text style={styles.logoText}>H</Text>
              </View>
            </LiquidGlassView>
            <Text style={styles.appName}>Harvest</Text>
            <Text style={styles.tagline}>Mindful Dating, Real Connections</Text>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome Back!</Text>
            <Text style={styles.welcomeSubtitle}>Choose how you&apos;d like to continue</Text>
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => loginWithOAuth('google')}
              testID="google-login"
              activeOpacity={0.8}
            >
              <LiquidGlassView
                intensity={60}
                tint="light"
                style={styles.socialButtonGlass}
                borderRadius={30}
                glassTint="rgba(255, 255, 255, 0.95)"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 10 }}>
                  <Ionicons
                    name="logo-google"
                    size={24}
                    color="#EA4335"
                    style={styles.socialIcon}
                  />
                  <Text style={[styles.socialButtonText, { color: '#333' }]}>
                    Continue with Google
                  </Text>
                </View>
              </LiquidGlassView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <LiquidGlassView
                intensity={60}
                tint="light"
                style={styles.socialButtonGlass}
                borderRadius={30}
                glassTint="rgba(255, 255, 255, 0.95)"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 10 }}>
                  <Ionicons
                    name="mail"
                    size={24}
                    color={theme.colors.primary}
                    style={styles.socialIcon}
                  />
                  <Text style={[styles.socialButtonText, { color: '#333' }]}>
                    Continue with Email
                  </Text>
                </View>
              </LiquidGlassView>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to our <Text style={styles.link}>Terms of Service</Text> and{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Background Decorations */}
          <View style={styles.decorations}>
            {decorations.map((decoration, i) => (
              <View
                key={i}
                style={[
                  styles.decoration,
                  {
                    left: decoration.left as any,
                    top: decoration.top as any,
                    transform: [{ rotate: decoration.rotation }] as any,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  appName: {
    color: theme.colors.text.primary,
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: theme.spacing.md,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  decoration: {
    height: 40,
    opacity: 0.1,
    position: 'absolute',
    width: 40,
  },
  decorations: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: -1,
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  logo: {
    alignItems: 'center',
    height: 100,
    justifyContent: 'center',
    width: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoText: {
    color: theme.colors.primary,
    fontSize: 52,
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
  },
  socialButton: {
    width: '100%',
  },
  socialButtonGlass: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md + 2,
  },
  socialButtonText: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  socialButtons: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  socialIcon: {
    marginRight: theme.spacing.md,
  },
  tagline: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    marginTop: theme.spacing.xs,
  },
  termsContainer: {
    bottom: 40,
    left: theme.spacing.xl,
    position: 'absolute',
    right: theme.spacing.xl,
  },
  termsText: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  welcomeContainer: {
    marginBottom: theme.spacing.xxl,
  },
  welcomeSubtitle: {
    color: theme.colors.text.secondary,
    fontSize: 16,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  welcomeTitle: {
    color: theme.colors.text.primary,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
