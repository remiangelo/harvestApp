import React from 'react';
import { View, StyleSheet, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../components/ui';
import { theme } from '../constants/theme';

export default function AuthScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={['#FFFFFF', '#FFF5F7', '#FFE5EA']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>H</Text>
            </View>
            <Text style={styles.appName}>Harvest</Text>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text variant="h1" align="center" style={styles.welcomeTitle}>
              Welcome!
            </Text>
            <Text variant="body" align="center" color="secondary" style={styles.welcomeSubtitle}>
              Let's dive into your account!
            </Text>
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={{ uri: 'https://img.icons8.com/color/48/facebook-new.png' }}
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonText}>Continue with Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Image
                source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }}
                style={styles.socialIcon}
              />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton} onPress={() => router.push('/login')}>
              <View style={styles.emailIcon}>
                <Text style={styles.emailIconText}>@</Text>
              </View>
              <Text style={styles.socialButtonText}>Continue with Email</Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text variant="caption" align="center" color="secondary">
              I accept Harvest's <Text style={styles.link}>Legal Terms</Text> &{' '}
              <Text style={styles.link}>Privacy Policy</Text>
            </Text>
          </View>

          {/* Background Decorations */}
          <View style={styles.decorations}>
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.decoration,
                  {
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    transform: [{ rotate: `${Math.random() * 360}deg` }],
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
    fontSize: 32,
    fontWeight: 'bold',
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
  emailIcon: {
    alignItems: 'center',
    backgroundColor: theme.colors.text.primary,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    width: 24,
  },
  emailIconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  logo: {
    alignItems: 'center',
    backgroundColor: '#F5E6E8',
    borderRadius: 24,
    height: 100,
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    width: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoText: {
    color: theme.colors.primary,
    fontSize: 48,
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
  },
  socialButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    elevation: 3,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    height: 24,
    marginRight: theme.spacing.md,
    width: 24,
  },
  termsContainer: {
    bottom: 40,
    left: theme.spacing.xl,
    position: 'absolute',
    right: theme.spacing.xl,
  },
  welcomeContainer: {
    marginBottom: theme.spacing.xxl,
  },
  welcomeSubtitle: {
    fontSize: 16,
  },
  welcomeTitle: {
    marginBottom: theme.spacing.sm,
  },
});
