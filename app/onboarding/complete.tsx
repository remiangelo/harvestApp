import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '../../hooks/useOnboarding';
import { Button, Text, Card } from '../../components/ui';
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

        <Text variant="h1" align="center" style={styles.title}>
          You're All Set! 🎉
        </Text>

        <Text variant="body" align="center" color="secondary" style={styles.subtitle}>
          Your profile is complete and you're ready to start your mindful dating journey.
        </Text>

        <Card variant="filled" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
            <Text variant="body" style={styles.infoText}>
              Your profile has been verified
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="lock-closed" size={24} color={theme.colors.primary} />
            <Text variant="body" style={styles.infoText}>
              Your data is secure and private
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="heart" size={24} color={theme.colors.primary} />
            <Text variant="body" style={styles.infoText}>
              Ready to find meaningful connections
            </Text>
          </View>
        </Card>

        <Button
          title="Start Exploring"
          onPress={handleComplete}
          loading={isSaving}
          fullWidth
          style={styles.button}
        />

        <Text variant="caption" align="center" color="secondary" style={styles.tip}>
          💡 Tip: Visit your Gardener AI coach anytime for dating advice
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    marginBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
  },
  infoCard: {
    width: '100%',
    marginBottom: theme.spacing.xxl,
    padding: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  button: {
    marginBottom: theme.spacing.xl,
  },
  tip: {
    paddingHorizontal: theme.spacing.lg,
  },
});