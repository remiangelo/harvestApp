import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { LiquidGlassView } from './liquid/LiquidGlassView';

const { width: screenWidth } = Dimensions.get('window');

interface MatchModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile: {
    name: string;
    photo: string;
  };
  matchProfile: {
    name: string;
    photo: string;
  };
  compatibility: {
    interests: number;
    personality: number;
    overall: number;
  };
}

export const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  onClose,
  userProfile,
  matchProfile,
  compatibility,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={30} tint="dark" style={styles.backdrop}>
        <View style={styles.container}>
          {/* Profile Cards */}
          <View style={styles.cardsContainer}>
            <View style={styles.cardWrapper}>
              <View style={[styles.card, styles.leftCard]}>
                <Image source={{ uri: userProfile.photo }} style={styles.photo} />
              </View>
              <View style={styles.heartBadge}>
                <Text style={styles.heartEmoji}>❤️</Text>
              </View>
            </View>
            
            <View style={[styles.card, styles.rightCard]}>
              <Image source={{ uri: matchProfile.photo }} style={styles.photo} />
              <View style={[styles.heartBadge, styles.rightHeartBadge]}>
                <Text style={styles.heartEmoji}>❤️</Text>
              </View>
            </View>
          </View>

          {/* Match Text */}
          <Text style={styles.matchTitle}>It's a match, {userProfile.name}!</Text>
          <Text style={styles.matchSubtitle}>
            We think you're a great match! Our algorithm{'\n'}
            has given you {compatibility.overall}% compatibility.
          </Text>
          <Text style={styles.matchHint}>
            Try asking them about their love for travel
          </Text>

          {/* Compatibility Metrics with Liquid Glass */}
          <View style={styles.metricsContainer}>
            <LiquidGlassView
              intensity={60}
              tint="light"
              style={styles.metricGlass}
              borderRadius={20}
            >
              <View style={styles.metric}>
                <View style={[styles.metricCircle, { borderColor: '#FF6B6B' }]}>
                  <Text style={styles.metricText}>{compatibility.interests}%</Text>
                </View>
                <Text style={styles.metricLabel}>Interests</Text>
              </View>
            </LiquidGlassView>

            <LiquidGlassView
              intensity={60}
              tint="light"
              style={styles.metricGlass}
              borderRadius={20}
            >
              <View style={styles.metric}>
                <View style={[styles.metricCircle, { borderColor: '#FFB901' }]}>
                  <Text style={styles.metricText}>{compatibility.personality}%</Text>
                </View>
                <Text style={styles.metricLabel}>Personality</Text>
              </View>
            </LiquidGlassView>

            <LiquidGlassView
              intensity={60}
              tint="light"
              style={styles.metricGlass}
              borderRadius={20}
            >
              <View style={styles.metric}>
                <View style={[styles.metricCircle, { borderColor: '#4ECDC4' }]}>
                  <Text style={styles.metricText}>{compatibility.overall}%</Text>
                </View>
                <Text style={styles.metricLabel}>Match</Text>
              </View>
            </LiquidGlassView>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Say hello</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Keep searching</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    padding: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    height: 200,
    width: 280,
  },
  cardWrapper: {
    position: 'relative',
  },
  card: {
    width: 140,
    height: 180,
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  leftCard: {
    transform: [{ rotate: '-10deg' }],
    zIndex: 1,
  },
  rightCard: {
    transform: [{ rotate: '10deg' }],
    marginLeft: -40,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  heartBadge: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rightHeartBadge: {
    right: 10,
    bottom: -10,
  },
  heartEmoji: {
    fontSize: 24,
  },
  matchTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#A0354E',
    marginBottom: 10,
    textAlign: 'center',
  },
  matchSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  matchHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  metricGlass: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metric: {
    alignItems: 'center',
  },
  metricCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  metricLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#A0354E',
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 15,
    width: screenWidth - 80,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 60,
    paddingVertical: 16,
    borderRadius: 30,
    width: screenWidth - 80,
  },
  secondaryButtonText: {
    color: '#A0354E',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});