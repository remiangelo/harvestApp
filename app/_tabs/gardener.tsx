import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassView } from '../../components/liquid/LiquidGlassView';
import { router } from 'expo-router';

const { width: screenWidth } = Dimensions.get('window');

interface LessonUnit {
  id: string;
  number: number;
  title: string;
  description: string;
  coins: number;
  score: number;
  isLocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
}

const units: LessonUnit[] = [
  {
    id: '1',
    number: 1,
    title: '1.1',
    description: '',
    coins: 0,
    score: 0,
    isLocked: false,
    isCompleted: true,
    isCurrent: false,
  },
  {
    id: '2',
    number: 1,
    title: '1.2',
    description: '',
    coins: 0,
    score: 0,
    isLocked: false,
    isCompleted: false,
    isCurrent: true,
  },
  {
    id: '3',
    number: 1,
    title: '1.3',
    description: '',
    coins: 0,
    score: 0,
    isLocked: true,
    isCompleted: false,
    isCurrent: false,
  },
];

const currentLesson = {
  number: '1.2',
  title: 'Is there a perfect person ?',
  description: 'Will learn :',
  coins: 3200,
  score: 8500,
};

export default function GardenerScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>The</Text>
          <Text style={styles.headerTitle}>Gardener</Text>
          <Text style={styles.headerSubtitle}>
            Chat with the Gardener, Practice Conversations, ...
          </Text>
        </View>

        {/* Gardener Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color="#A0354E" />
          </View>
          <TouchableOpacity style={styles.startChatButton}>
            <Text style={styles.startChatText}>Start Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Growth Opportunities Section */}
        <LinearGradient colors={['#A0354E', '#8B1E2D']} style={styles.growthSection}>
          <Text style={styles.growthTitle}>Growth</Text>
          <Text style={styles.growthTitle}>Opportunities</Text>

          {/* Unit Cards */}
          <View style={styles.unitsRow}>
            {units.map((unit) => (
              <TouchableOpacity key={unit.id} style={styles.unitCard} disabled={unit.isLocked}>
                <Text style={styles.unitLabel}>Unit {unit.number}</Text>
                <View
                  style={[
                    styles.unitCircle,
                    unit.isCompleted && styles.unitCompleted,
                    unit.isCurrent && styles.unitCurrent,
                    unit.isLocked && styles.unitLocked,
                  ]}
                >
                  {unit.isLocked ? (
                    <Ionicons name="lock-closed" size={24} color="#666" />
                  ) : (
                    <Text
                      style={[
                        styles.unitNumber,
                        unit.isCompleted && styles.unitNumberCompleted,
                        unit.isCurrent && styles.unitNumberCurrent,
                      ]}
                    >
                      {unit.title}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Current Lesson Card with Liquid Glass */}
          <LiquidGlassView
            intensity={85}
            tint="light"
            style={styles.lessonCard}
            borderRadius={20}
            glassTint="rgba(255, 255, 255, 0.95)"
          >
            <Text style={styles.lessonNumber}>{currentLesson.number}</Text>
            <Text style={styles.lessonTitle}>{currentLesson.title}</Text>
            <Text style={styles.lessonDescription}>{currentLesson.description}</Text>

            <View style={styles.rewardsRow}>
              <View style={styles.rewardItem}>
                <View style={styles.coinIcon}>
                  <Text style={styles.coinEmoji}>🪙</Text>
                </View>
                <View>
                  <Text style={styles.rewardValue}>{currentLesson.coins}</Text>
                  <Text style={styles.rewardLabel}>Coins</Text>
                </View>
              </View>

              <View style={styles.rewardItem}>
                <View style={styles.starIcon}>
                  <Text style={styles.starEmoji}>⭐</Text>
                </View>
                <View>
                  <Text style={styles.rewardValue}>{currentLesson.score}</Text>
                  <Text style={styles.rewardLabel}>Score</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          </LiquidGlassView>

          {/* Additional Lessons */}
          <View style={styles.additionalLessons}>
            <LiquidGlassView
              intensity={80}
              tint="light"
              style={styles.miniLessonCard}
              borderRadius={16}
            >
              <Text style={styles.miniLessonTitle}>Fun Facts</Text>
            </LiquidGlassView>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  additionalLessons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#F5E6F0',
    borderRadius: 50,
    height: 100,
    justifyContent: 'center',
    marginBottom: 15,
    width: 100,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  coinEmoji: {
    fontSize: 20,
  },
  coinIcon: {
    alignItems: 'center',
    backgroundColor: '#FFB901',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 10,
    width: 40,
  },
  container: {
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  growthSection: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  growthTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 20,
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 5,
    paddingHorizontal: 40,
    textAlign: 'center',
  },
  headerTitle: {
    color: '#1a1a1a',
    fontSize: 32,
    fontWeight: 'bold',
  },
  lessonCard: {
    marginBottom: 20,
    padding: 25,
  },
  lessonDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  lessonNumber: {
    color: '#1a1a1a',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  lessonTitle: {
    color: '#1a1a1a',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  miniLessonCard: {
    alignItems: 'center',
    padding: 20,
    width: (screenWidth - 60) / 2,
  },
  miniLessonTitle: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
  rewardItem: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  rewardLabel: {
    color: '#666',
    fontSize: 12,
  },
  rewardValue: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  starEmoji: {
    fontSize: 20,
  },
  starIcon: {
    alignItems: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 10,
    width: 40,
  },
  startButton: {
    backgroundColor: '#A0354E',
    borderRadius: 25,
    paddingVertical: 15,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  startChatButton: {
    backgroundColor: '#A0354E',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  startChatText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  unitCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 15,
    width: (screenWidth - 60) / 3,
  },
  unitCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  unitCompleted: {
    backgroundColor: '#34C759',
  },
  unitCurrent: {
    backgroundColor: '#FF3B5C',
  },
  unitLabel: {
    color: 'white',
    fontSize: 12,
    marginBottom: 8,
  },
  unitLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  unitNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  unitNumberCompleted: {
    color: 'white',
  },
  unitNumberCurrent: {
    color: 'white',
  },
  unitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    marginTop: 25,
  },
});
