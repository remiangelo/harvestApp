import { theme } from '../../constants/theme';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsOfServiceScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms of Service</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.lastUpdated}>Last Updated: January 21, 2025</Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using Harvest (&quot;the App&quot;), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use the App.
          </Text>

          <Text style={styles.sectionTitle}>2. Eligibility</Text>
          <Text style={styles.paragraph}>
            You must be at least 18 years of age to use Harvest. By using the App, you represent and
            warrant that you are at least 18 years old and have the legal capacity to enter into
            this agreement.
          </Text>

          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activities that occur under your account. You agree to notify us immediately of
            any unauthorized use of your account.
          </Text>

          <Text style={styles.sectionTitle}>4. User Conduct</Text>
          <Text style={styles.paragraph}>You agree not to:</Text>
          <Text style={styles.bulletPoint}>
            • Use the App for any unlawful purpose or in violation of any regulations
          </Text>
          <Text style={styles.bulletPoint}>• Harass, abuse, or harm other users in any way</Text>
          <Text style={styles.bulletPoint}>• Impersonate any person or entity</Text>
          <Text style={styles.bulletPoint}>
            • Post or share content that is offensive, inappropriate, or violates our Community
            Guidelines
          </Text>
          <Text style={styles.bulletPoint}>
            • Attempt to gain unauthorized access to our systems or other users&apos; accounts
          </Text>

          <Text style={styles.sectionTitle}>5. Content</Text>
          <Text style={styles.paragraph}>
            You retain ownership of any content you post on Harvest. However, by posting content,
            you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify,
            and display your content in connection with the App&apos;s operation.
          </Text>

          <Text style={styles.sectionTitle}>6. Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to suspend or terminate your account at any time, with or without
            notice, for any reason, including violation of these Terms of Service or our Community
            Guidelines.
          </Text>

          <Text style={styles.sectionTitle}>7. Disclaimers</Text>
          <Text style={styles.paragraph}>
            The App is provided &quot;as is&quot; without warranties of any kind. We do not
            guarantee that the App will be uninterrupted, error-free, or completely secure.
          </Text>

          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            To the fullest extent permitted by law, Harvest and its affiliates shall not be liable
            for any indirect, incidental, special, consequential, or punitive damages arising out of
            or relating to your use of the App.
          </Text>

          <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms of Service at any time. Your continued use of
            the App after changes are posted constitutes your acceptance of the modified terms.
          </Text>

          <Text style={styles.sectionTitle}>10. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms of Service, please contact us at:
          </Text>
          <Text style={styles.contact}>support@harvestdating.com</Text>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
  },
  bottomSpacer: {
    height: 40,
  },
  bulletPoint: {
    color: '#333',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 8,
  },
  contact: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerTitle: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  lastUpdated: {
    color: '#999',
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  paragraph: {
    color: '#333',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  placeholder: {
    width: 40,
  },
  safeArea: {
    backgroundColor: '#fff',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
  },
});
