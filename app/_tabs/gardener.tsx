import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlassView } from '../../components/liquid/LiquidGlassView';
import { theme } from '../../constants/theme';
import { GardenerChat } from '../../components/gardener/GardenerChat';
import { DailyQuizPopup } from '../../components/gardener/DailyQuizPopup';
import { useGardenerStore } from '../../stores/useGardenerStore';
import { useRouter } from 'expo-router';

interface DatingTip {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'conversation' | 'profile' | 'safety' | 'mindfulness';
  gradient: string[];
}

const datingTips: DatingTip[] = [
  {
    id: '1',
    title: 'Start with Open Questions',
    description:
      'Ask questions that invite storytelling rather than yes/no answers. Try "What\'s been the highlight of your week?" instead of "How was your day?"',
    icon: 'chatbubbles',
    category: 'conversation',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: '2',
    title: 'Authentic Profile Photos',
    description:
      'Use recent photos that show your genuine smile and interests. Include at least one full-body shot and photos doing activities you love.',
    icon: 'camera',
    category: 'profile',
    gradient: ['#f093fb', '#f5576c'],
  },
  {
    id: '3',
    title: 'Trust Your Instincts',
    description:
      "If something feels off, it probably is. Always meet in public places for first dates and tell a friend where you're going.",
    icon: 'shield-checkmark',
    category: 'safety',
    gradient: ['#4facfe', '#00f2fe'],
  },
  {
    id: '4',
    title: 'Practice Mindful Swiping',
    description:
      'Take time to read profiles thoroughly. Quality over quantity leads to better matches and more meaningful connections.',
    icon: 'heart',
    category: 'mindfulness',
    gradient: ['#fa709a', '#fee140'],
  },
  {
    id: '5',
    title: 'Be Present on Dates',
    description:
      'Put your phone away and give your full attention. Active listening shows respect and helps build genuine connection.',
    icon: 'eye',
    category: 'mindfulness',
    gradient: ['#30cfd0', '#330867'],
  },
  {
    id: '6',
    title: 'Share Your Boundaries',
    description:
      "It's okay to communicate what you're comfortable with. Healthy relationships start with mutual respect and clear communication.",
    icon: 'hand-left',
    category: 'safety',
    gradient: ['#a8edea', '#fed6e3'],
  },
];

interface QuickAdvice {
  id: string;
  question: string;
  answer: string;
}

const quickAdvice: QuickAdvice[] = [
  {
    id: '1',
    question: 'How long should I wait to text back?',
    answer:
      "There's no magic formula! Respond when you genuinely have time to engage. Playing games with response times often backfires.",
  },
  {
    id: '2',
    question: 'Should I use pick-up lines?',
    answer:
      'Genuine compliments or observations about their profile work better than generic pick-up lines. Be yourself!',
  },
  {
    id: '3',
    question: 'When should we meet in person?',
    answer:
      "When you feel comfortable! Usually after a few days of good conversation. Trust your gut and don't rush.",
  },
];

import { getDailyReflection, getLastReflection } from '../../lib/gardener';

export default function GardenerScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedAdvice, setExpandedAdvice] = useState<string | null>(null);
  const [reflection, setReflection] = useState<string>('');
  const [showChat, setShowChat] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const { shouldShowDailyQuiz, markQuizShown } = useGardenerStore();

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  React.useEffect(() => {
    // Load last reflection or today's reflection
    (async () => {
      const last = await getLastReflection();
      if (last) setReflection(last);
      else setReflection(await getDailyReflection());
    })();
  }, []);

  useEffect(() => {
    // Check if we should show the daily quiz popup
    const timer = setTimeout(() => {
      if (shouldShowDailyQuiz()) {
        setShowQuiz(true);
      }
    }, 2000); // Show after 2 seconds on screen

    return () => clearTimeout(timer);
  }, [shouldShowDailyQuiz]);

  const categories = [
    { id: 'all', label: 'All Tips', icon: 'apps' },
    { id: 'conversation', label: 'Conversation', icon: 'chatbubbles' },
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'safety', label: 'Safety', icon: 'shield' },
    { id: 'mindfulness', label: 'Mindfulness', icon: 'heart' },
  ];

  const filteredTips =
    selectedCategory === 'all'
      ? datingTips
      : datingTips.filter((tip) => tip.category === selectedCategory);

  const handleQuizAnswer = (_questionId: string, _answer: string) => {
    // The answer here is the option ID, not the value
    // The actual quiz response handling is done in DailyQuizPopup component
    // This callback is optional and can be used for additional tracking if needed
  };

  if (showChat) {
    return <GardenerChat onBack={() => setShowChat(false)} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with Gradient */}
      <LinearGradient colors={['#A0354E', '#8B1E2D', '#701625']} style={styles.headerGradient}>
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>The Gardener</Text>
              <Text style={styles.headerSubtitle}>Your Dating Coach</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => router.push('/gardener-settings' as any)}
                style={styles.headerButton}
              >
                <LiquidGlassView
                  intensity={50}
                  tint="light"
                  style={styles.headerIcon}
                  borderRadius={25}
                  glassTint="rgba(255, 255, 255, 0.2)"
                >
                  <Ionicons name="settings" size={24} color="white" />
                </LiquidGlassView>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowChat(true)} style={styles.headerButton}>
                <LiquidGlassView
                  intensity={50}
                  tint="light"
                  style={styles.headerIcon}
                  borderRadius={25}
                  glassTint="rgba(255, 255, 255, 0.2)"
                >
                  <Ionicons name="chatbubbles" size={26} color="white" />
                </LiquidGlassView>
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <LiquidGlassView
                  intensity={selectedCategory === category.id ? 70 : 40}
                  tint="light"
                  style={styles.categoryChip}
                  borderRadius={20}
                  glassTint={
                    selectedCategory === category.id
                      ? 'rgba(255, 255, 255, 0.3)'
                      : 'rgba(255, 255, 255, 0.15)'
                  }
                >
                  <Ionicons
                    name={category.icon as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color="white"
                    style={styles.categoryIcon}
                  />
                  <Text style={styles.categoryText}>{category.label}</Text>
                </LiquidGlassView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Dating Tips Section */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.sectionTitle}>Dating Tips & Insights</Text>

          {filteredTips.map((tip) => (
            <TouchableOpacity key={tip.id} activeOpacity={0.9} style={styles.tipCard}>
              <LiquidGlassView
                intensity={65}
                tint="light"
                style={styles.tipGlass}
                borderRadius={20}
                glassTint="rgba(255, 255, 255, 0.92)"
              >
                <LinearGradient
                  colors={tip.gradient as any}
                  style={styles.tipIcon}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={tip.icon as any} size={24} color="white" />
                </LinearGradient>

                <View style={styles.tipContent}>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDescription}>{tip.description}</Text>

                  <View style={styles.tipFooter}>
                    <View style={styles.tipCategory}>
                      <Text style={styles.tipCategoryText}>
                        {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
                      </Text>
                    </View>
                    <Ionicons name="bookmark-outline" size={20} color={theme.colors.primary} />
                  </View>
                </View>
              </LiquidGlassView>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Quick Advice Section */}
        <View style={styles.adviceSection}>
          <Text style={styles.sectionTitle}>Quick Advice</Text>

          {quickAdvice.map((advice) => (
            <TouchableOpacity
              key={advice.id}
              onPress={() => setExpandedAdvice(expandedAdvice === advice.id ? null : advice.id)}
              activeOpacity={0.8}
            >
              <LiquidGlassView
                intensity={60}
                tint="light"
                style={styles.adviceCard}
                borderRadius={16}
                glassTint="rgba(255, 255, 255, 0.9)"
              >
                <View style={styles.adviceHeader}>
                  <Ionicons
                    name="help-circle"
                    size={24}
                    color={theme.colors.primary}
                    style={styles.adviceIcon}
                  />
                  <Text style={styles.adviceQuestion}>{advice.question}</Text>
                  <Ionicons
                    name={expandedAdvice === advice.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#999"
                  />
                </View>

                {expandedAdvice === advice.id && (
                  <View style={styles.adviceContent}>
                    <Text style={styles.adviceAnswer}>{advice.answer}</Text>
                  </View>
                )}
              </LiquidGlassView>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Reflection */}
        <LiquidGlassView
          intensity={70}
          tint="light"
          style={styles.reflectionCard}
          borderRadius={20}
          glassTint="rgba(255, 255, 255, 0.95)"
        >
          <LinearGradient
            colors={['#A0354E', '#8B1E2D']}
            style={styles.reflectionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="sparkles" size={24} color="white" />
            <Text style={styles.reflectionTitle}>Daily Reflection</Text>
          </LinearGradient>

          <Text style={styles.reflectionText}>“{reflection || 'Loading…'}”</Text>

          <TouchableOpacity
            style={styles.reflectionButton}
            onPress={async () => setReflection(await getDailyReflection(new Date(Date.now() + 1)))}
          >
            <Text style={styles.reflectionButtonText}>Get New Reflection</Text>
          </TouchableOpacity>
        </LiquidGlassView>
      </ScrollView>

      {/* Daily Quiz Popup */}
      <DailyQuizPopup
        visible={showQuiz}
        onClose={() => {
          setShowQuiz(false);
          markQuizShown();
        }}
        onAnswer={handleQuizAnswer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  adviceAnswer: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  adviceCard: {
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 16,
  },
  adviceContent: {
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  adviceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  adviceIcon: {
    marginRight: 12,
  },
  adviceQuestion: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    paddingRight: 10,
  },
  adviceSection: {
    marginTop: 32,
  },
  categoriesContainer: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  categoryChip: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    backgroundColor: '#F8F8F8',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerButton: {
    marginLeft: 8,
  },
  headerButtons: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  headerContent: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 8,
  },
  headerIcon: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  reflectionButton: {
    alignItems: 'center',
    borderColor: theme.colors.primary,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  reflectionButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  reflectionCard: {
    marginBottom: 100,
    marginHorizontal: 16,
    marginTop: 32,
    padding: 20,
  },
  reflectionGradient: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  reflectionText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    textAlign: 'center',
  },
  reflectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  tipCard: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  tipCategory: {
    backgroundColor: 'rgba(160, 53, 78, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tipCategoryText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  tipContent: {
    flex: 1,
    marginLeft: 16,
  },
  tipDescription: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  tipFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  tipGlass: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    padding: 16,
  },
  tipIcon: {
    alignItems: 'center',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  tipTitle: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
