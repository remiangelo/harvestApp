import React, { useState } from 'react';
import { View, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/useAuthStore';
import useUserStore from '../stores/useUserStore';
import { Button, Input, Text, Card } from '../components/ui';
import { theme } from '../constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, register } = useAuthStore();
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

  // For development/demo purposes only
  const handleDemoLogin = async () => {
    setEmail('demo@harvest.com');
    setPassword('demo123');
    setLoading(true);
    
    // In production, this would be a real demo account
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Demo Mode',
        'In production, this would use a real demo account. For now, please create a new account.',
        [
          {
            text: 'OK',
            onPress: () => setIsLogin(false)
          }
        ]
      );
    }, 1000);
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

            {/* Demo Button - Only in development */}
            {__DEV__ && (
              <Button
                title="Use Demo Credentials"
                onPress={handleDemoLogin}
                variant="outline"
                loading={loading}
              />
            )}
          </View>

          {/* Info Card for Development */}
          {__DEV__ && (
            <Card variant="filled" style={styles.infoCard}>
              <Text variant="bodySmall" weight="semibold">
                Development Mode
              </Text>
              <Text variant="caption" color="secondary" style={styles.infoText}>
                Create a new account to test the app. 
                Supabase integration requires environment variables.
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
}); 