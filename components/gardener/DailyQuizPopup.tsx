import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gardenerService, QuizQuestion } from '../../lib/ai/gardenerService';
import { gardenerQuizService, gardenerInsightsService } from '../../lib/gardenerSupabase';
import { useUser } from '../../context/UserContext';
import { theme } from '../../constants/theme';

interface DailyQuizPopupProps {
  visible: boolean;
  onClose: () => void;
  onAnswer?: (questionId: string, answer: string) => void;
}

const QUIZ_STORAGE_KEY = '@harvest_daily_quiz';
const LAST_QUIZ_DATE_KEY = '@harvest_last_quiz_date';

export const DailyQuizPopup: React.FC<DailyQuizPopupProps> = ({ visible, onClose, onAnswer }) => {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAnswered, setHasAnswered] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const { currentUser: user } = useUser();

  useEffect(() => {
    if (visible) {
      loadOrGenerateQuestion();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      setSelectedOption(null);
      setHasAnswered(false);
    }
  }, [visible]);

  const loadOrGenerateQuestion = async () => {
    setIsLoading(true);
    try {
      // Check if user is authenticated for DB sync
      if (user?.id) {
        // Check if quiz was already shown today in DB
        const wasShownToday = await gardenerQuizService.wasQuizShownToday(user.id);

        if (wasShownToday) {
          // Load from local storage if already shown
          const savedQuiz = await AsyncStorage.getItem(QUIZ_STORAGE_KEY);
          if (savedQuiz) {
            setQuestion(JSON.parse(savedQuiz));
            setIsLoading(false);
            return;
          }
        }

        // Get quiz history from database
        const dbHistory = await gardenerQuizService.getUserQuizHistory(user.id);
        const previousQuizzes = dbHistory.map((q) => q.question).slice(-7);

        // Generate new question
        const newQuestion = await gardenerService.generateDailyQuiz(previousQuizzes);

        // Save to database
        const savedQuestion = await gardenerQuizService.saveOrGetQuestion(
          newQuestion.question,
          newQuestion.options,
          newQuestion.category
        );

        if (savedQuestion) {
          newQuestion.id = savedQuestion.id || newQuestion.id;
          // Track that quiz was shown
          await gardenerQuizService.trackDailyQuiz(user.id, savedQuestion.id);
        }

        // Save locally as well
        await AsyncStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(newQuestion));
        await AsyncStorage.setItem(LAST_QUIZ_DATE_KEY, new Date().toDateString());

        setQuestion(newQuestion);
      } else {
        // Fallback to local storage for non-authenticated users
        const todayKey = new Date().toDateString();
        const lastQuizDate = await AsyncStorage.getItem(LAST_QUIZ_DATE_KEY);

        if (lastQuizDate === todayKey) {
          // Load existing question
          const savedQuiz = await AsyncStorage.getItem(QUIZ_STORAGE_KEY);
          if (savedQuiz) {
            setQuestion(JSON.parse(savedQuiz));
            setIsLoading(false);
            return;
          }
        }

        // Generate new question
        const previousQuizzes = await getPreviousQuizTopics();
        const newQuestion = await gardenerService.generateDailyQuiz(previousQuizzes);

        // Save question for today
        await AsyncStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(newQuestion));
        await AsyncStorage.setItem(LAST_QUIZ_DATE_KEY, todayKey);

        setQuestion(newQuestion);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      // Use fallback quiz
      const fallbackQuiz = await gardenerService.generateDailyQuiz();
      setQuestion(fallbackQuiz);
    }
    setIsLoading(false);
  };

  const getPreviousQuizTopics = async (): Promise<string[]> => {
    try {
      const history = await AsyncStorage.getItem('@harvest_quiz_history');
      if (history) {
        const parsed = JSON.parse(history);
        return parsed.slice(-7).map((q: any) => q.question);
      }
    } catch (error) {
      console.error('Error loading quiz history:', error);
    }
    return [];
  };

  const saveQuizResponse = async () => {
    if (!question || !selectedOption) return;

    try {
      // Find the selected option details
      const selectedOpt = question.options.find((opt) => opt.id === selectedOption);
      if (!selectedOpt) return;

      // Save to database if authenticated
      if (user?.id && question.id) {
        await gardenerQuizService.saveQuizResponse(
          user.id,
          question.id,
          selectedOption,
          selectedOpt.value
        );

        // Mark as answered in database
        await gardenerQuizService.markQuizAnswered(user.id);

        // Update user insights based on the category
        const insightUpdate: any = {};
        switch (question.category) {
          case 'dating_style':
            insightUpdate.dating_style = selectedOpt.value;
            break;
          case 'communication':
            insightUpdate.communication_preference = selectedOpt.value;
            break;
          case 'relationship_goals':
            insightUpdate.relationship_goals = selectedOpt.value;
            break;
          case 'values':
            await gardenerInsightsService.addCoreValue(user.id, selectedOpt.value);
            break;
        }

        if (Object.keys(insightUpdate).length > 0) {
          await gardenerInsightsService.updateUserInsights(user.id, insightUpdate);
        }
      }

      // Also save to local history
      const history = (await AsyncStorage.getItem('@harvest_quiz_history')) || '[]';
      const parsed = JSON.parse(history);
      parsed.push({
        ...question,
        userAnswer: selectedOption,
        answeredAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem('@harvest_quiz_history', JSON.stringify(parsed));

      // Mark as answered locally
      await AsyncStorage.setItem(`@harvest_quiz_answered_${question.id}`, 'true');
    } catch (error) {
      console.error('Error saving quiz response:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOption || !question) return;

    setHasAnswered(true);
    await saveQuizResponse();

    if (onAnswer) {
      onAnswer(question.id, selectedOption);
    }

    // Close after a delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onClose();
      });
    }, 1500);
  };

  const handleOptionSelect = (optionId: string) => {
    if (!hasAnswered) {
      setSelectedOption(optionId);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />

        <Animated.View style={[styles.popup, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={[theme.colors.primarySoft, 'rgba(139, 30, 45, 0.1)']}
            style={styles.gradientBackground}
          />

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.iconGradient}
              >
                <Ionicons name="sparkles" size={24} color="white" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>Daily Reflection</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Preparing your daily question...</Text>
            </View>
          ) : question ? (
            <>
              <Text style={styles.question}>{question.question}</Text>

              <View style={styles.optionsContainer}>
                {question.options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.option,
                      selectedOption === option.id && styles.selectedOption,
                      hasAnswered && selectedOption === option.id && styles.answeredOption,
                    ]}
                    onPress={() => handleOptionSelect(option.id)}
                    disabled={hasAnswered}
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.optionCircle,
                          selectedOption === option.id && styles.selectedCircle,
                        ]}
                      >
                        {selectedOption === option.id && <View style={styles.innerCircle} />}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          selectedOption === option.id && styles.selectedOptionText,
                        ]}
                      >
                        {option.text}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {!hasAnswered ? (
                <TouchableOpacity
                  style={[styles.submitButton, !selectedOption && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={!selectedOption}
                >
                  <LinearGradient
                    colors={
                      selectedOption
                        ? [theme.colors.primary, theme.colors.primaryDark]
                        : ['#ccc', '#aaa']
                    }
                    style={styles.submitGradient}
                  >
                    <Text style={styles.submitText}>Submit Answer</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <View style={styles.thankYouContainer}>
                  <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                  <Text style={styles.thankYouText}>Thank you for sharing!</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.errorText}>Unable to load today&apos;s question</Text>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  answeredOption: {
    backgroundColor: theme.colors.primarySoft,
  },
  closeButton: {
    padding: 4,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: '#999',
    fontSize: 16,
    paddingVertical: 20,
    textAlign: 'center',
  },
  gradientBackground: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 12,
  },
  iconGradient: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  innerCircle: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#666',
    fontSize: 14,
    marginTop: 12,
  },
  option: {
    backgroundColor: 'white',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  optionCircle: {
    alignItems: 'center',
    borderColor: '#ccc',
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    marginRight: 12,
    width: 20,
  },
  optionContent: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 16,
  },
  optionText: {
    color: '#666',
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  popup: {
    backgroundColor: 'white',
    borderRadius: 24,
    elevation: 10,
    maxWidth: 400,
    overflow: 'hidden',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    width: Dimensions.get('window').width - 40,
  },
  question: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: 24,
  },
  selectedCircle: {
    borderColor: theme.colors.primary,
  },
  selectedOption: {
    backgroundColor: theme.colors.primarySoft,
    borderColor: theme.colors.primary,
  },
  selectedOptionText: {
    color: '#333',
    fontWeight: '500',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  thankYouContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  thankYouText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  title: {
    color: '#333',
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
});
