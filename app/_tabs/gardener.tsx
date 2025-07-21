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
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
        <LinearGradient
          colors={['#A0354E', '#8B1E2D']}
          style={styles.growthSection}
        >
          <Text style={styles.growthTitle}>Growth</Text>
          <Text style={styles.growthTitle}>Opportunities</Text>

          {/* Unit Cards */}
          <View style={styles.unitsRow}>
            {units.map((unit) => (
              <TouchableOpacity 
                key={unit.id} 
                style={styles.unitCard}
                disabled={unit.isLocked}
              >
                <Text style={styles.unitLabel}>Unit {unit.number}</Text>
                <View style={[
                  styles.unitCircle,
                  unit.isCompleted && styles.unitCompleted,
                  unit.isCurrent && styles.unitCurrent,
                  unit.isLocked && styles.unitLocked,
                ]}>
                  {unit.isLocked ? (
                    <Ionicons name="lock-closed" size={24} color="#666" />
                  ) : (
                    <Text style={[
                      styles.unitNumber,
                      unit.isCompleted && styles.unitNumberCompleted,
                      unit.isCurrent && styles.unitNumberCurrent,
                    ]}>
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
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F5E6F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  startChatButton: {
    backgroundColor: '#A0354E',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startChatText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  growthSection: {
    flex: 1,
    marginTop: 20,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 100,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  growthTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  unitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
    marginBottom: 25,
  },
  unitCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 16,
    width: (screenWidth - 60) / 3,
  },
  unitLabel: {
    color: 'white',
    fontSize: 12,
    marginBottom: 8,
  },
  unitCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitCompleted: {
    backgroundColor: '#34C759',
  },
  unitCurrent: {
    backgroundColor: '#FF3B5C',
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
  lessonCard: {
    padding: 25,
    marginBottom: 20,
  },
  lessonNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 10,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 10,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFB901',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  starIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  coinEmoji: {
    fontSize: 20,
  },
  starEmoji: {
    fontSize: 20,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  rewardLabel: {
    fontSize: 12,
    color: '#666',
  },
  startButton: {
    backgroundColor: '#A0354E',
    paddingVertical: 15,
    borderRadius: 25,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  additionalLessons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  miniLessonCard: {
    width: (screenWidth - 60) / 2,
    padding: 20,
    alignItems: 'center',
  },
  miniLessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
});