import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/useAuthStore';
import useUserStore from '../stores/useUserStore';
import { Button, Input, Text, Card } from '../components/ui';
import { theme } from '../constants/theme';
import { DemoUser } from '../data/demoUsers';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();
  const { login, register, setTestMode, setAuthenticated } = useAuthStore();
  const { setCurrentUser } = useUserStore();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleResendVerification = async (emailToVerify: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailToVerify,
        options: {
          emailRedirectTo: 'harvestapp://auth/callback',
        },
      });
      setLoading(false);

      if (error) {
        Alert.alert('Error', 'Failed to resend verification email. Please try again.');
      } else {
        Alert.alert(
          'Email Sent',
          `Verification email has been sent to ${emailToVerify}. Please check your inbox.`
        );
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (text && !validateEmail(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (text && !validatePassword(text)) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleLogin = async () => {
    // Validate inputs before submitting
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isEmailValid) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!isPasswordValid) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);

    if (error) {
      // Check if error is due to unconfirmed email
      if (
        error.message?.includes('Email not confirmed') ||
        error.message?.includes('email_not_confirmed')
      ) {
        Alert.alert(
          'Email Not Verified',
          'Please check your email and click the verification link before logging in.',
          [
            { text: 'OK' },
            {
              text: 'Resend Email',
              onPress: () => handleResendVerification(email),
            },
          ]
        );
      } else {
        Alert.alert(
          'Login Failed',
          error.message || 'Invalid email or password. Please try again.'
        );
      }
    } else {
      // Check if user has completed onboarding
      const authState = useAuthStore.getState();
      if (authState.profile?.onboarding_completed) {
        router.push('/_tabs');
      } else {
        router.push('/onboarding');
      }
    }
  };

  const handleSignup = async () => {
    // Validate inputs before submitting
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isEmailValid) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!isPasswordValid) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const { error, data } = await register(email, password);
    setLoading(false);

    if (error) {
      // Provide specific error messages based on error type
      let errorTitle = 'Signup Failed';
      let errorMessage = 'Failed to create account. Please try again.';

      if (
        error.message?.includes('already registered') ||
        error.message?.includes('already exists')
      ) {
        errorTitle = 'Email Already Registered';
        errorMessage =
          'This email is already registered. Please sign in instead or use a different email.';
      } else if (error.message?.includes('invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('password')) {
        errorMessage = 'Password must be at least 6 characters long.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(errorTitle, errorMessage);
    } else {
      // Check if email confirmation is required
      const authState = useAuthStore.getState();
      if (authState.isAuthenticated && data?.user?.email_confirmed_at) {
        // Auto-confirm is enabled, user can proceed
        router.push('/onboarding');
      } else if (data?.user && !data.user.email_confirmed_at) {
        // Email verification required
        Alert.alert(
          'Verify Your Email',
          `We've sent a verification link to ${email}. Please check your inbox and click the link to activate your account.`,
          [{ text: 'OK' }]
        );
        setIsLogin(true); // Switch to login view
      } else if (authState.isAuthenticated) {
        // Fallback for auto-confirmed users
        router.push('/onboarding');
      } else {
        // Email confirmation required
        Alert.alert(
          'Check Your Email 📧',
          'We sent you a confirmation email. Please check your inbox and click the link to activate your account.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Stay on login screen so they can login after confirming
              },
            },
          ]
        );
      }
    }
  };

  // For development/demo purposes only - TEST MODE
  const handleTestMode = async () => {
    setLoading(true);

    // Create a mock user for testing without Supabase
    const mockUser: DemoUser = {
      email: 'testuser@harvest.com',
      password: 'testpass', // Not used in test mode
      name: 'Test User',
      role: 'user' as const,
      nickname: 'Test User',
      age: new Date(1998, 0, 1), // 25 years old approx
      bio: 'Testing the app without email auth',
      location: 'Test City',
      photos: [],
      onboardingCompleted: false,
    };

    try {
      // Store in AsyncStorage first
      await AsyncStorage.setItem('harvest-test-mode', 'true');
      await AsyncStorage.setItem('harvest-test-user', JSON.stringify(mockUser));

      // Update auth store to mark as authenticated in test mode
      setTestMode(true);
      setAuthenticated(true);

      // Set the mock user in the user store
      setCurrentUser(mockUser);

      // Small delay to ensure state updates propagate
      setTimeout(() => {
        setLoading(false);
        // Force navigation to onboarding
        router.replace('/onboarding');
      }, 100);
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to enable test mode');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color={theme.colors.text.primary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logo}>
              <Ionicons name="heart" size={60} color={theme.colors.primary} />
            </View>
            <Text variant="h1" color="primary" align="center">
              Welcome to Harvest
            </Text>
            <Text variant="body" color="secondary" align="center" style={styles.subtitle}>
              Mindful Dating, Real Connections
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Input
              label={isLogin ? 'Email' : 'Your Email'}
              placeholder="Enter your email"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
              leftIcon={<Ionicons name="mail" size={20} color={theme.colors.text.secondary} />}
            />

            <Input
              label={isLogin ? 'Password' : 'Create Password'}
              placeholder={isLogin ? 'Enter your password' : 'Min. 6 characters'}
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={passwordError}
              leftIcon={
                <Ionicons name="lock-closed" size={20} color={theme.colors.text.secondary} />
              }
              rightIcon={
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={theme.colors.text.secondary}
                />
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Button
              title={
                loading
                  ? isLogin
                    ? 'Signing In...'
                    : 'Creating Account...'
                  : isLogin
                    ? 'Sign In'
                    : 'Create Account'
              }
              onPress={isLogin ? handleLogin : handleSignup}
              loading={loading}
              style={styles.mainButton}
            />

            <Button
              title={
                isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'
              }
              onPress={() => setIsLogin(!isLogin)}
              variant="ghost"
              style={styles.switchButton}
              textStyle={styles.switchButtonText}
            />

            {/* Test Mode Button - Available for testing */}
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text variant="caption" color="secondary" style={styles.dividerText}>
                  OR
                </Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title={loading ? 'Entering Test Mode...' : 'Enter Test Mode (No Email Required)'}
                onPress={handleTestMode}
                variant="outline"
                loading={loading}
                style={styles.testButton}
                icon={<Ionicons name="flask" size={20} color={theme.colors.primary} />}
              />
            </>
          </View>

          {/* Info Card for Development */}
          {__DEV__ && (
            <Card variant="filled" style={styles.infoCard}>
              <Text variant="bodySmall" weight="semibold">
                Development Mode
              </Text>
              <Text variant="caption" color="secondary" style={styles.infoText}>
                Use &quot;Test Mode&quot; button above to bypass email authentication. This creates
                a local test user for development.
              </Text>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    left: theme.spacing.md,
    padding: theme.spacing.sm,
    position: 'absolute',
    top: Platform.OS === 'ios' ? theme.spacing.xxl : theme.spacing.lg,
    zIndex: 1,
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  divider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    backgroundColor: theme.colors.border,
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
  },
  formSection: {
    marginBottom: theme.spacing.xl,
  },
  infoCard: {
    marginTop: theme.spacing.lg,
  },
  infoText: {
    marginTop: theme.spacing.xs,
  },
  keyboardView: {
    flex: 1,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.full,
    height: 100,
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    width: 100,
    ...theme.shadows.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  mainButton: {
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
  },
  switchButton: {
    marginBottom: theme.spacing.md,
  },
  switchButtonText: {
    color: theme.colors.primary,
  },
  testButton: {
    marginBottom: theme.spacing.md,
  },
});
