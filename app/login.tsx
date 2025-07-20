import React, { useState } from 'react';
import { View, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/useAuthStore';
import useUserStore from '../stores/useUserStore';
import { Button, Input, Text, Card } from '../components/ui';
import { theme } from '../constants/theme';
import { DemoUser } from '../data/demoUsers';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register, setTestMode, setAuthenticated } = useAuthStore();
  const { setCurrentUser } = useUserStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await login(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password. Please try again.');
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
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const { error } = await register(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Signup Failed', error.message || 'Failed to create account. Please try again.');
    } else {
      Alert.alert(
        'Account Created! 🎉',
        'Your account has been created successfully. Welcome to Harvest!',
        [
          {
            text: 'Continue',
            onPress: () => router.push('/onboarding')
          }
        ]
      );
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
      onboardingCompleted: false
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
              label={isLogin ? "Email" : "Your Email"}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Ionicons name="mail" size={20} color={theme.colors.text.secondary} />}
            />

            <Input
              label={isLogin ? "Password" : "Create Password"}
              placeholder={isLogin ? "Enter your password" : "Min. 6 characters"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              leftIcon={<Ionicons name="lock-closed" size={20} color={theme.colors.text.secondary} />}
              rightIcon={
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.colors.text.secondary}
                />
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Button
              title={isLogin ? 'Sign In' : 'Create Account'}
              onPress={isLogin ? handleLogin : handleSignup}
              loading={loading}
              style={styles.mainButton}
            />

            <Button
              title={isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              onPress={() => setIsLogin(!isLogin)}
              variant="ghost"
              style={styles.switchButton}
            />

            {/* Test Mode Button - Only in development */}
            {__DEV__ && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text variant="caption" color="secondary" style={styles.dividerText}>
                    OR
                  </Text>
                  <View style={styles.dividerLine} />
                </View>
                
                <Button
                  title="Enter Test Mode (No Email Required)"
                  onPress={handleTestMode}
                  variant="outline"
                  loading={loading}
                  style={styles.testButton}
                  icon={<Ionicons name="flask" size={20} color={theme.colors.primary} />}
                />
              </>
            )}
          </View>

          {/* Info Card for Development */}
          {__DEV__ && (
            <Card variant="filled" style={styles.infoCard}>
              <Text variant="bodySmall" weight="semibold">
                Development Mode
              </Text>
              <Text variant="caption" color="secondary" style={styles.infoText}>
                Use "Test Mode" button above to bypass email authentication.
                This creates a local test user for development.
              </Text>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
  },
  formSection: {
    marginBottom: theme.spacing.xl,
  },
  mainButton: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  switchButton: {
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    marginTop: theme.spacing.lg,
  },
  infoText: {
    marginTop: theme.spacing.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
  },
  testButton: {
    marginBottom: theme.spacing.md,
  },
}); 