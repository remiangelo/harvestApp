import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { GardenerChat } from '../../components/gardener/GardenerChat';
import { DailyQuizPopup } from '../../components/gardener/DailyQuizPopup';
import { useGardenerStore } from '../../stores/useGardenerStore';

export default function GardenerChatScreen() {
  const [showQuiz, setShowQuiz] = useState(false);
  const { shouldShowDailyQuiz, markQuizShown } = useGardenerStore();

  useEffect(() => {
    // Check if we should show the daily quiz popup
    const timer = setTimeout(() => {
      if (shouldShowDailyQuiz()) {
        setShowQuiz(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [shouldShowDailyQuiz]);

  const handleQuizAnswer = (_questionId: string, _answer: string) => {
    // Quiz response handling is done in DailyQuizPopup component
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark, '#701625']}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="leaf" size={28} color="white" />
            </View>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>The Gardener</Text>
              <Text style={styles.headerSubtitle}>Your AI Dating Coach</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Chat */}
      <View style={styles.chatContainer}>
        <GardenerChat />
      </View>

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
  chatContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: '#F8F8F8',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: 8,
  },
  headerIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
