import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

interface Question {
  id: string;
  text: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: 'relationship',
    text: 'What are you looking for?',
    options: ['Long-term', 'Something casual', 'Friendship'],
  },
  {
    id: 'personality',
    text: 'How would friends describe you?',
    options: ['Adventurous', 'Thoughtful', 'Spontaneous'],
  },
  {
    id: 'date',
    text: 'Ideal first date?',
    options: ['Coffee', 'Outdoor activity', 'Dinner'],
  },
];

export default function QuestionnaireScreen() {
  const insets = useSafeAreaInsets();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const selectOption = (qid: string, option: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: option }));
  };

  const handleSubmit = () => {
    Alert.alert('Thanks!', 'Your answers have been submitted.');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const y = event.nativeEvent.contentOffset.y;
          // Notify tab bar about scroll
          if ((global as any).handleTabBarScroll) {
            (global as any).handleTabBarScroll(y);
          }
        }}
        scrollEventThrottle={16}
      >
        {questions.map((q) => (
          <View key={q.id} style={styles.question}>
            <Text style={styles.questionText}>{q.text}</Text>
            {q.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.option, answers[q.id] === option && styles.optionSelected]}
                onPress={() => selectOption(q.id, option)}
              >
                <Text
                  style={[styles.optionText, answers[q.id] === option && styles.optionTextSelected]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <Button title="Submit" onPress={handleSubmit} style={styles.submitButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background, flex: 1 },
  content: { padding: theme.spacing.lg },
  option: {
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  optionSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  optionText: { color: theme.colors.text.primary },
  optionTextSelected: { color: theme.colors.text.inverse },
  question: { marginBottom: theme.spacing.xl },
  questionText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
  },
  submitButton: { marginTop: theme.spacing.lg },
});
