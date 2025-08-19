import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { LiquidGlassView } from '../components/liquid/LiquidGlassView';
import { useAuthStore } from '../stores/useAuthStore';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How does matching work?',
    answer: "Swipe right to like, left to pass. When both users like each other, it's a match!",
    category: 'Matching',
  },
  {
    id: '2',
    question: 'Is Harvest free to use?',
    answer: 'Yes! Core features are free. Premium subscriptions unlock additional features.',
    category: 'Billing',
  },
  {
    id: '3',
    question: 'How do I report someone?',
    answer: 'Tap the three dots in any chat or profile and select "Report User".',
    category: 'Safety',
  },
  {
    id: '4',
    question: 'Can I undo a swipe?',
    answer: 'Premium members can undo their last swipe using the rewind feature.',
    category: 'Features',
  },
  {
    id: '5',
    question: 'How do I delete my account?',
    answer: 'Go to Settings > Account > Delete Account. This action is permanent.',
    category: 'Account',
  },
  {
    id: '6',
    question: 'Why am I not getting matches?',
    answer: 'Try adding more photos, writing a detailed bio, and being active daily.',
    category: 'Matching',
  },
];

const categories = ['All', 'Matching', 'Billing', 'Safety', 'Features', 'Account'];

export default function HelpCenterScreen() {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);

  const filteredFAQs = faqData.filter(
    (faq) => selectedCategory === 'All' || faq.category === selectedCategory
  );

  const handleSubmitTicket = async () => {
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setSubmitting(true);

    // Simulate sending email ticket
    setTimeout(() => {
      Alert.alert(
        'Ticket Submitted! 🎫',
        `We've received your support request. Ticket #${Math.random().toString(36).substr(2, 9).toUpperCase()}\n\nWe'll respond within 24 hours to ${profile?.email || user?.email}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowTicketForm(false);
              setTicketSubject('');
              setTicketMessage('');
              setTicketCategory('General');
            },
          },
        ]
      );
      setSubmitting(false);
    }, 1500);
  };

  const sendEmailTicket = () => {
    // In production, this would call an API endpoint to send email
    const ticketData = {
      from: profile?.email || user?.email || 'user@harvest.com',
      to: 'support@harvest.dating',
      subject: `[${ticketCategory}] ${ticketSubject}`,
      body: ticketMessage,
      userId: user?.id,
      userName: profile?.nickname || 'User',
      timestamp: new Date().toISOString(),
    };

    console.log('Sending ticket:', ticketData);
    // TODO: Implement actual email sending via backend API
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#A0354E', '#8B1E2D']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Center</Text>
        <Text style={styles.headerSubtitle}>How can we help you today?</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowTicketForm(true)}
            >
              <LinearGradient colors={['#A0354E', '#8B1E2D']} style={styles.quickActionGradient}>
                <Ionicons name="mail" size={24} color="white" />
                <Text style={styles.quickActionText}>Contact Support</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/FAQ' as any)}
            >
              <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.quickActionGradient}>
                <Ionicons name="book" size={24} color="white" />
                <Text style={styles.quickActionText}>Full FAQ</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* FAQ Section */}
          <View style={styles.faqSection}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {filteredFAQs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                onPress={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                activeOpacity={0.8}
              >
                <LiquidGlassView
                  intensity={60}
                  tint="light"
                  style={styles.faqCard}
                  borderRadius={16}
                  glassTint="rgba(255, 255, 255, 0.9)"
                >
                  <View style={styles.faqHeader}>
                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                    <Ionicons
                      name={expandedFAQ === faq.id ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#999"
                    />
                  </View>
                  {expandedFAQ === faq.id && (
                    <View style={styles.faqContent}>
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                      <View style={styles.faqCategory}>
                        <Text style={styles.faqCategoryText}>{faq.category}</Text>
                      </View>
                    </View>
                  )}
                </LiquidGlassView>
              </TouchableOpacity>
            ))}
          </View>

          {/* Support Ticket Form */}
          {showTicketForm && (
            <LiquidGlassView
              intensity={70}
              tint="light"
              style={styles.ticketForm}
              borderRadius={20}
              glassTint="rgba(255, 255, 255, 0.95)"
            >
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTitle}>Submit a Support Ticket</Text>
                <TouchableOpacity onPress={() => setShowTicketForm(false)}>
                  <Ionicons name="close" size={24} color="#999" />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.categorySelect}>
                  {['General', 'Technical', 'Billing', 'Safety', 'Account'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setTicketCategory(cat)}
                      style={[
                        styles.categoryOption,
                        ticketCategory === cat && styles.categoryOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          ticketCategory === cat && styles.categoryOptionTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Subject</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Brief description of your issue"
                  value={ticketSubject}
                  onChangeText={setTicketSubject}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Message</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Please describe your issue in detail..."
                  value={ticketMessage}
                  onChangeText={setTicketMessage}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  placeholderTextColor="#999"
                />
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmitTicket}
                disabled={submitting}
              >
                <LinearGradient colors={['#A0354E', '#8B1E2D']} style={styles.submitGradient}>
                  {submitting ? (
                    <Text style={styles.submitText}>Sending...</Text>
                  ) : (
                    <>
                      <Ionicons name="send" size={20} color="white" />
                      <Text style={styles.submitText}>Submit Ticket</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.responseTime}>Average response time: 24 hours</Text>
            </LiquidGlassView>
          )}

          {/* Additional Resources */}
          <View style={styles.resourcesSection}>
            <Text style={styles.sectionTitle}>Additional Resources</Text>

            <TouchableOpacity style={styles.resourceCard}>
              <Ionicons name="shield" size={24} color={theme.colors.primary} />
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>Safety Guidelines</Text>
                <Text style={styles.resourceDescription}>Learn how to stay safe while dating</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resourceCard}>
              <Ionicons name="document-text" size={24} color={theme.colors.primary} />
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>Terms of Service</Text>
                <Text style={styles.resourceDescription}>Read our terms and conditions</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.resourceCard}>
              <Ionicons name="lock-closed" size={24} color={theme.colors.primary} />
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>Privacy Policy</Text>
                <Text style={styles.resourceDescription}>Learn how we protect your data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    left: 20,
    position: 'absolute',
    top: 50,
    zIndex: 1,
  },
  categoryChip: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryOption: {
    borderColor: '#E0E0E0',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 2,
    paddingVertical: 8,
  },
  categoryOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryOptionText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  categoryOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  categoryScroll: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  categorySelect: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoryText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  container: {
    backgroundColor: '#F8F8F8',
    flex: 1,
  },
  faqAnswer: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  faqCard: {
    marginBottom: 12,
    padding: 16,
  },
  faqCategory: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(160, 53, 78, 0.1)',
    borderRadius: 12,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  faqCategoryText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  faqContent: {
    borderTopColor: '#E0E0E0',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  faqHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    paddingRight: 10,
  },
  faqSection: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 60,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 5,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    backgroundColor: 'white',
    borderColor: '#E0E0E0',
    borderRadius: 10,
    borderWidth: 1,
    color: theme.colors.text.primary,
    fontSize: 14,
    marginTop: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  label: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionButton: {
    borderRadius: 15,
    flex: 1,
    marginHorizontal: 5,
    overflow: 'hidden',
  },
  quickActionGradient: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  quickActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  quickActions: {
    flexDirection: 'row',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  resourceCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
  },
  resourceContent: {
    flex: 1,
    marginLeft: 15,
  },
  resourceDescription: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  resourceTitle: {
    color: theme.colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  resourcesSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  responseTime: {
    color: '#999',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 20,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  submitButton: {
    borderRadius: 25,
    marginTop: 10,
    overflow: 'hidden',
  },
  submitGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  ticketForm: {
    marginBottom: 30,
    marginHorizontal: 20,
    padding: 20,
  },
  ticketHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  ticketTitle: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
