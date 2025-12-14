import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

export default function TermsScreen() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleValidate = () => {
    if (ageConfirmed && termsAccepted) {
      // These are validation flags only - don't save to database
      // Just return empty object to allow progression
      return {};
    }
    return null;
  };

  const openTermsOfService = () => {
    router.push('/legal/terms-of-service' as any);
  };

  const openPrivacyPolicy = () => {
    router.push('/legal/privacy-policy' as any);
  };

  const openCommunityGuidelines = () => {
    router.push('/legal/community-guidelines' as any);
  };

  return (
    <OnboardingScreen
      progress={100}
      currentStep="terms"
      nextStep="complete"
      onValidate={handleValidate}
      showBackButton={true}
      buttonDisabled={!(ageConfirmed && termsAccepted)}
    >
      <Text style={styles.title}>Terms & Privacy</Text>
      <Text style={styles.subtitle}>Before we continue, please confirm:</Text>
      <View style={styles.container}>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgeConfirmed(!ageConfirmed)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkboxBox, ageConfirmed && styles.checkboxBoxChecked]}>
              {ageConfirmed && <Ionicons name="checkmark" size={20} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>I am at least 18 years old</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setTermsAccepted(!termsAccepted)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkboxBox, termsAccepted && styles.checkboxBoxChecked]}>
              {termsAccepted && <Ionicons name="checkmark" size={20} color="#fff" />}
            </View>
            <View style={styles.checkboxLabelContainer}>
              <Text style={styles.checkboxLabel}>
                I agree to the{' '}
                <Text style={styles.link} onPress={openTermsOfService}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text style={styles.link} onPress={openPrivacyPolicy}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.guidelinesButton} onPress={openCommunityGuidelines}>
          <Text style={styles.guidelinesButtonText}>View Community Guidelines</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.infoText}>
            By continuing, you acknowledge that you have read and understood our policies.
          </Text>
        </View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
  },
  checkboxBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: theme.colors.primary,
    borderRadius: 6,
    borderWidth: 2,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  checkboxBoxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxContainer: {
    marginBottom: 20,
    width: '100%',
  },
  checkboxLabel: {
    color: '#333',
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  container: {
    gap: 12,
    width: '100%',
  },
  guidelinesButton: {
    alignItems: 'center',
    borderColor: theme.colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    padding: 16,
  },
  guidelinesButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    alignItems: 'flex-start',
    backgroundColor: theme.colors.primarySoft,
    borderLeftColor: theme.colors.primary,
    borderLeftWidth: 4,
    borderRadius: 8,
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    padding: 16,
  },
  infoText: {
    color: '#666',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: theme.colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  subtitle: {
    color: '#555',
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  title: {
    color: '#222',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
});
