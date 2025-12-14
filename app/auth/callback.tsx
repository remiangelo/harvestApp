import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';
import { theme } from '../../constants/theme';

/**
 * OAuth callback handler route.
 * This screen handles the redirect from OAuth providers (Google, etc.)
 * and processes the authentication tokens.
 */
export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setSession, setUser, loadProfile } = useAuthStore();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start subtle rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      console.log('[AuthCallback] Processing OAuth callback...');
      console.log('[AuthCallback] Params:', params);

      // Get the full URL to extract tokens from hash fragment
      const url = await Linking.getInitialURL();
      console.log('[AuthCallback] Initial URL:', url);

      let accessToken: string | null = null;
      let refreshToken: string | null = null;

      // Check URL params first (from expo-router)
      if (params.access_token) {
        accessToken = String(params.access_token);
        refreshToken = params.refresh_token ? String(params.refresh_token) : null;
        console.log('[AuthCallback] Found tokens in route params');
      }

      // Try hash fragment from URL (most common for OAuth)
      if (!accessToken && url && url.includes('#')) {
        const hashPart = url.split('#')[1];
        const hashParams = new URLSearchParams(hashPart);
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
        console.log('[AuthCallback] Found tokens in hash fragment');
      }

      if (accessToken && refreshToken) {
        console.log('[AuthCallback] Setting session with OAuth tokens...');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('[AuthCallback] Error setting session:', error);
          router.replace('/login');
          return;
        }

        if (data.session && data.user) {
          console.log('[AuthCallback] OAuth session set successfully!');
          setSession(data.session);
          setUser(data.user);

          // Ensure profile exists for OAuth user
          try {
            console.log('[AuthCallback] Ensuring profile exists for user:', data.user.id);
            const { ensureProfileExists } = await import('../../lib/profileHelpers');
            await ensureProfileExists(data.user.id);
            console.log('[AuthCallback] Profile confirmed, loading full profile...');
            await loadProfile(data.user.id);
            console.log('[AuthCallback] Profile loaded successfully');
          } catch (profileError) {
            console.error('[AuthCallback] Failed to ensure profile:', profileError);
          }

          // Navigate to main app - AuthGuard will handle routing
          router.replace('/');
        }
      } else {
        console.error('[AuthCallback] No OAuth tokens found');
        router.replace('/login');
      }
    } catch (error) {
      console.error('[AuthCallback] Error handling callback:', error);
      router.replace('/login');
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Animated Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.loadingContainer}>
        <Text style={styles.text}>Signing you in</Text>
        <Animated.View style={[styles.dotsContainer, { transform: [{ rotate: spin }] }]}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </Animated.View>
      </View>

      {/* Brand text */}
      <Text style={styles.brandText}>Harvest</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brandText: {
    bottom: 50,
    color: theme.colors.primary,
    fontFamily: 'OrangeSquash',
    fontSize: 28,
    position: 'absolute',
  },
  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    flex: 1,
    justifyContent: 'center',
  },
  dot: {
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    height: 8,
    marginHorizontal: 4,
    width: 8,
  },
  dot1: {
    opacity: 0.3,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 32,
  },
  logo: {
    height: 120,
    width: 120,
  },
  logoContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 30,
    elevation: 8,
    height: 140,
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    width: 140,
  },
  text: {
    color: theme.colors.text.secondary,
    fontSize: 18,
    fontWeight: '500',
  },
});
