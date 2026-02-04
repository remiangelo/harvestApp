import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';

export default function CommunityGuidelinesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community Guidelines</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text style={styles.lastUpdated}>Last Updated: January 21, 2025</Text>

          <Text style={styles.intro}>
            Welcome to Harvest! Our community is built on mindfulness, respect, and authentic
            connection. These guidelines help create a safe and positive environment for everyone.
          </Text>

          <Text style={styles.sectionTitle}>🌱 Be Authentic</Text>
          <Text style={styles.paragraph}>
            Use real photos of yourself. Don&apos;t misrepresent your age, identity, or intentions.
            We value honesty and genuine connections.
          </Text>

          <Text style={styles.sectionTitle}>💚 Show Respect</Text>
          <Text style={styles.paragraph}>
            Treat others with kindness and respect. Everyone deserves to feel safe and valued. No
            harassment, hate speech, or discriminatory behavior will be tolerated.
          </Text>

          <Text style={styles.sectionTitle}>🚫 Prohibited Content</Text>
          <Text style={styles.paragraph}>The following is strictly prohibited:</Text>
          <Text style={styles.bulletPoint}>• Nudity or sexually explicit content</Text>
          <Text style={styles.bulletPoint}>• Harassment, bullying, or threatening behavior</Text>
          <Text style={styles.bulletPoint}>• Hate speech or discriminatory language</Text>
          <Text style={styles.bulletPoint}>• Violence or graphic content</Text>
          <Text style={styles.bulletPoint}>• Spam, scams, or fraudulent activity</Text>
          <Text style={styles.bulletPoint}>• Promotion of illegal activities</Text>
          <Text style={styles.bulletPoint}>• Impersonation of others</Text>

          <Text style={styles.sectionTitle}>💬 Mindful Communication</Text>
          <Text style={styles.paragraph}>
            Communicate thoughtfully and respectfully. Our Mindful Messaging feature helps you pause
            before sending messages that might be hurtful. Listen to your inner wisdom.
          </Text>

          <Text style={styles.sectionTitle}>🔒 Protect Your Privacy</Text>
          <Text style={styles.paragraph}>
            Don&apos;t share personal information too quickly. Use our in-app chat until you feel
            comfortable sharing contact details. Never share financial information.
          </Text>

          <Text style={styles.sectionTitle}>⚠️ Report Concerns</Text>
          <Text style={styles.paragraph}>
            If you encounter behavior that violates these guidelines, please report it immediately.
            We review all reports and take appropriate action, which may include account suspension
            or removal.
          </Text>

          <Text style={styles.sectionTitle}>🌟 Mindful Dating Principles</Text>
          <Text style={styles.bulletPoint}>• Be present in your conversations</Text>
          <Text style={styles.bulletPoint}>• Practice empathy and emotional intelligence</Text>
          <Text style={styles.bulletPoint}>• Communicate your boundaries clearly</Text>
          <Text style={styles.bulletPoint}>• Respect when others say no</Text>
          <Text style={styles.bulletPoint}>• Take time to reflect before reacting</Text>
          <Text style={styles.bulletPoint}>• Seek genuine connection, not just validation</Text>

          <Text style={styles.sectionTitle}>🤝 Our Commitment</Text>
          <Text style={styles.paragraph}>
            We&apos;re committed to fostering a community where mindful dating thrives. We
            continuously work to improve safety features and maintain a respectful environment for
            all users.
          </Text>

          <Text style={styles.sectionTitle}>📧 Contact Us</Text>
          <Text style={styles.paragraph}>
            Questions about these guidelines? Need support? Reach out to us:
          </Text>
          <Text style={styles.contact}>support@harvestdating.com</Text>

          <View style={styles.thankYou}>
            <Ionicons name="heart" size={24} color={theme.colors.primary} />
            <Text style={styles.thankYouText}>
              Thank you for being part of our mindful community!
            </Text>
          </View>

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
  intro: {
    color: '#555',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
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
  thankYou: {
    alignItems: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 12,
    gap: 12,
    marginTop: 32,
    padding: 24,
  },
  thankYouText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
