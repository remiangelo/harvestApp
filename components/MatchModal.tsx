import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassView, LiquidGlassButton, LiquidGlassBadge } from './liquid';

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
  const insets = useSafeAreaInsets();
  
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} presentationStyle="overFullScreen">
      <BlurView intensity={30} tint="dark" style={styles.backdrop}>
        <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
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
            <LiquidGlassBadge
              label="Interests"
              value={`${compatibility.interests}%`}
              color="#FF6B6B"
              size="large"
            />
            <LiquidGlassBadge
              label="Personality"
              value={`${compatibility.personality}%`}
              color="#FFB901"
              size="large"
            />
            <LiquidGlassBadge
              label="Match"
              value={`${compatibility.overall}%`}
              color="#4ECDC4"
              size="large"
            />
          </View>

          {/* Action Buttons */}
          <LiquidGlassButton
            title="Say hello"
            variant="primary"
            size="large"
            onPress={onClose}
            style={styles.primaryButton}
          />

          <LiquidGlassButton
            title="Keep searching"
            variant="secondary"
            size="large"
            onPress={onClose}
            style={styles.secondaryButton}
          />
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
