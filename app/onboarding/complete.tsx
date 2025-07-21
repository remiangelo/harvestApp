import React from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../hooks/useOnboarding';
import { Button, Card } from '../../components/ui';
import { theme } from '../../constants/theme';

export default function OnboardingComplete() {
  const { finishOnboarding, isSaving } = useOnboarding();

  const handleComplete = async () => {
    await finishOnboarding();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={120} color={theme.colors.success} />
        </View>

        <Text style={styles.title}>You're All Set! 🎉</Text>

        <Text style={styles.subtitle}>
          Your profile is complete and you're ready to start your mindful dating journey.
        </Text>

        <Card variant="filled" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
            <Text style={styles.infoText}>Your profile has been verified</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="lock-closed" size={24} color={theme.colors.primary} />
            <Text style={styles.infoText}>Your data is secure and private</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="heart" size={24} color={theme.colors.primary} />
            <Text style={styles.infoText}>Ready to find meaningful connections</Text>
          </View>
        </Card>

        <Button
          title="Start Exploring"
          onPress={handleComplete}
          loading={isSaving}
          fullWidth
          style={styles.button}
        />

        <Text style={styles.tip}>
          💡 Tip: Visit your Gardener AI coach anytime for dating advice
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    marginBottom: theme.spacing.xl,
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  infoCard: {
    marginBottom: theme.spacing.xxl,
    padding: theme.spacing.lg,
    width: '100%',
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  infoText: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: 14,
    marginLeft: theme.spacing.md,
  },
  subtitle: {
    color: theme.colors.text.secondary,
    fontSize: 16,
    marginBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    textAlign: 'center',
  },
  tip: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    paddingHorizontal: theme.spacing.lg,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
});
