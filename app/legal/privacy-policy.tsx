import { theme } from '../../constants/theme';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.lastUpdated}>Last Updated: January 21, 2025</Text>

          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information you provide directly to us when you create an account, including:
          </Text>
          <Text style={styles.bulletPoint}>• Name and age</Text>
          <Text style={styles.bulletPoint}>• Email address</Text>
          <Text style={styles.bulletPoint}>• Profile photos</Text>
          <Text style={styles.bulletPoint}>• Bio and interests</Text>
          <Text style={styles.bulletPoint}>• Location data (if you choose to share)</Text>
          <Text style={styles.bulletPoint}>• Dating preferences and relationship goals</Text>

          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>We use the information we collect to:</Text>
          <Text style={styles.bulletPoint}>• Provide and improve our services</Text>
          <Text style={styles.bulletPoint}>
            • Connect you with potential matches based on your preferences
          </Text>
          <Text style={styles.bulletPoint}>
            • Send you notifications about matches and messages
          </Text>
          <Text style={styles.bulletPoint}>• Ensure safety and prevent fraud</Text>
          <Text style={styles.bulletPoint}>• Provide customer support</Text>
          <Text style={styles.bulletPoint}>• Communicate updates and promotional offers</Text>

          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.paragraph}>We may share your information with:</Text>
          <Text style={styles.bulletPoint}>
            • Other users: Your profile information is visible to users you match with
          </Text>
          <Text style={styles.bulletPoint}>
            • Service providers: Third-party companies that help us operate the App
          </Text>
          <Text style={styles.bulletPoint}>
            • Legal authorities: When required by law or to protect our rights and users
          </Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information to third parties for marketing purposes.
          </Text>

          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement reasonable security measures to protect your information. However, no
            method of transmission or storage is 100% secure, and we cannot guarantee absolute
            security.
          </Text>

          <Text style={styles.sectionTitle}>5. Location Data</Text>
          <Text style={styles.paragraph}>
            If you enable location services, we collect and use your location to show you potential
            matches nearby. You can disable location services at any time in your device settings.
          </Text>

          <Text style={styles.sectionTitle}>6. Your Rights and Choices</Text>
          <Text style={styles.paragraph}>You have the right to:</Text>
          <Text style={styles.bulletPoint}>• Access and update your profile information</Text>
          <Text style={styles.bulletPoint}>• Delete your account and associated data</Text>
          <Text style={styles.bulletPoint}>• Opt out of promotional communications</Text>
          <Text style={styles.bulletPoint}>• Control your privacy settings within the App</Text>

          <Text style={styles.sectionTitle}>7. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your information for as long as your account is active or as needed to provide
            services. If you delete your account, we will remove your personal information within 30
            days, except as required by law.
          </Text>

          <Text style={styles.sectionTitle}>8. Children&apos;s Privacy</Text>
          <Text style={styles.paragraph}>
            Harvest is not intended for users under 18. We do not knowingly collect information from
            individuals under 18. If we become aware of such collection, we will delete it
            immediately.
          </Text>

          <Text style={styles.sectionTitle}>9. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes by posting a notice in the App or sending you an email.
          </Text>

          <Text style={styles.sectionTitle}>10. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy or your data, please contact us at:
          </Text>
          <Text style={styles.contact}>privacy@harvestdating.com</Text>

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
