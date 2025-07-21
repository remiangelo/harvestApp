import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Image } from 'react-native';
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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
          <Text style={styles.matchHint}>Try asking them about their love for travel</Text>

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
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 5,
    height: 180,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: 140,
  },
  cardWrapper: {
    position: 'relative',
  },
  cardsContainer: {
    flexDirection: 'row',
    height: 200,
    marginBottom: 30,
    width: 280,
  },
  container: {
    alignItems: 'center',
    padding: 20,
  },
  heartBadge: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    bottom: -10,
    elevation: 3,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: -10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: 40,
  },
  heartEmoji: {
    fontSize: 24,
  },
  leftCard: {
    transform: [{ rotate: '-10deg' }],
    zIndex: 1,
  },
  matchHint: {
    color: '#999',
    fontSize: 14,
    marginBottom: 30,
    textAlign: 'center',
  },
  matchSubtitle: {
    color: '#666',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
    textAlign: 'center',
  },
  matchTitle: {
    color: '#A0354E',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  metric: {
    alignItems: 'center',
  },
  metricCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    borderWidth: 3,
    height: 50,
    justifyContent: 'center',
    marginBottom: 6,
    width: 50,
  },
  metricGlass: {
    alignItems: 'center',
    height: 90,
    justifyContent: 'center',
    width: 90,
  },
  metricLabel: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  metricText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    width: '100%',
  },
  photo: {
    height: '100%',
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#A0354E',
    borderRadius: 30,
    marginBottom: 15,
    paddingHorizontal: 60,
    paddingVertical: 16,
    width: screenWidth - 80,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rightCard: {
    marginLeft: -40,
    transform: [{ rotate: '10deg' }],
  },
  rightHeartBadge: {
    bottom: -10,
    right: 10,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    paddingHorizontal: 60,
    paddingVertical: 16,
    width: screenWidth - 80,
  },
  secondaryButtonText: {
    color: '#A0354E',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
