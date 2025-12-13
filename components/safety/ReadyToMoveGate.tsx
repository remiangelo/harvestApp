import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { safetyService } from '../../lib/ai/safetyAnalysisService';
import { getSafetyColor, getSafetyLevel } from '../../lib/ai/safetyConfig';
import { theme } from '../../constants/theme';

interface ReadyToMoveGateProps {
  visible: boolean;
  onClose: () => void;
  conversationId: string;
  userId: string;
  matchId: string;
  matchName: string;
  onApproved: (contactInfo: { phone?: string; social?: string }) => void;
}

export const ReadyToMoveGate: React.FC<ReadyToMoveGateProps> = ({
  visible,
  onClose,
  conversationId,
  userId,
  matchId,
  matchName,
  onApproved,
}) => {
  const [loading, setLoading] = useState(true);
  const [safetyData, setSafetyData] = useState<any>(null);
  const [contactMethod, setContactMethod] = useState<'phone' | 'social' | null>(null);
  const [contactInfo, setContactInfo] = useState('');

  useEffect(() => {
    if (visible) {
      checkSafety();
    }
  }, [visible]);

  const checkSafety = async () => {
    setLoading(true);
    try {
      const result = await safetyService.checkReadyToMove(conversationId, userId, matchId);
      setSafetyData(result);
    } catch (error) {
      console.error('Safety check error:', error);
      Alert.alert('Error', 'Unable to perform safety check. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceed = () => {
    if (!safetyData?.canMove) {
      Alert.alert(
        'Safety Warning',
        'Our AI has detected potential safety concerns. Are you sure you want to proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Proceed Anyway',
            style: 'destructive',
            onPress: () => proceedWithSharing(),
          },
        ]
      );
    } else {
      proceedWithSharing();
    }
  };

  const proceedWithSharing = () => {
    if (!contactMethod) {
      Alert.alert('Select Contact Method', 'Please choose how you want to share contact info.');
      return;
    }

    onApproved({
      phone: contactMethod === 'phone' ? contactInfo : undefined,
      social: contactMethod === 'social' ? contactInfo : undefined,
    });
    onClose();
  };

  const renderSafetyScore = () => {
    if (!safetyData) return null;

    const score = safetyData.analysis.safetyScore;
    const level = getSafetyLevel(score);
    const color = getSafetyColor(score);

    return (
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: color }]}>
          <Text style={[styles.scoreText, { color }]}>{score}</Text>
          <Text style={[styles.scoreLabel, { color }]}>Safety Score</Text>
        </View>
        <Text style={[styles.levelText, { color }]}>
          {level.charAt(0).toUpperCase() + level.slice(1)}
        </Text>
      </View>
    );
  };

  const renderRequiredActions = () => {
    if (!safetyData?.requiredActions || safetyData.requiredActions.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Required Actions</Text>
        {safetyData.requiredActions.map((action: string, index: number) => (
          <View key={index} style={styles.actionItem}>
            <Ionicons name="alert-circle" size={20} color="#FF9800" />
            <Text style={styles.actionText}>{action}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSafetyTips = () => {
    if (!safetyData?.safetyTips || safetyData.safetyTips.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Safety Tips</Text>
        {safetyData.safetyTips.map((tip: string, index: number) => (
          <View key={index} style={styles.tipItem}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderRedFlags = () => {
    const redFlags = safetyData?.analysis?.redFlags || [];
    if (redFlags.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: '#F44336' }]}>⚠️ Warning Signs Detected</Text>
        {redFlags.map((flag: any, index: number) => (
          <View key={index} style={styles.redFlagItem}>
            <View
              style={[
                styles.severityBadge,
                {
                  backgroundColor:
                    flag.severity === 'critical'
                      ? '#F44336'
                      : flag.severity === 'high'
                        ? '#FF9800'
                        : '#FFC107',
                },
              ]}
            >
              <Text style={styles.severityText}>{flag.severity}</Text>
            </View>
            <Text style={styles.redFlagText}>{flag.message}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderContactOptions = () => {
    if (!safetyData?.canMove) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share Contact Info</Text>

        <TouchableOpacity
          style={[styles.contactOption, contactMethod === 'phone' && styles.contactOptionSelected]}
          onPress={() => setContactMethod('phone')}
        >
          <Ionicons
            name="call-outline"
            size={24}
            color={contactMethod === 'phone' ? theme.colors.primary : '#666'}
          />
          <Text
            style={[
              styles.contactOptionText,
              contactMethod === 'phone' && styles.contactOptionTextSelected,
            ]}
          >
            Phone Number
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.contactOption, contactMethod === 'social' && styles.contactOptionSelected]}
          onPress={() => setContactMethod('social')}
        >
          <Ionicons
            name="logo-instagram"
            size={24}
            color={contactMethod === 'social' ? theme.colors.primary : '#666'}
          />
          <Text
            style={[
              styles.contactOptionText,
              contactMethod === 'social' && styles.contactOptionTextSelected,
            ]}
          >
            Social Media
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.container}>
        <BlurView intensity={90} style={StyleSheet.absoluteFillObject} />

        <View style={styles.content}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.header}
          >
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>

            <Text style={styles.title}>Ready to Move Off App?</Text>
            <Text style={styles.subtitle}>Safety check for {matchName}</Text>
          </LinearGradient>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Analyzing conversation safety...</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {renderSafetyScore()}
              {renderRedFlags()}
              {renderRequiredActions()}
              {renderSafetyTips()}
              {renderContactOptions()}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, !safetyData?.canMove && styles.buttonDisabled]}
                  onPress={handleProceed}
                  disabled={!contactMethod && safetyData?.canMove}
                >
                  <LinearGradient
                    colors={safetyData?.canMove ? ['#4CAF50', '#45a049'] : ['#999', '#777']}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>
                      {safetyData?.canMove ? 'Share Contact Info' : 'Not Recommended'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  actionItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  actionText: {
    color: '#666',
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  button: {
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  buttonContainer: {
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    alignItems: 'center',
    padding: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 15,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 30,
    zIndex: 1,
  },
  contactOption: {
    alignItems: 'center',
    borderColor: '#E0E0E0',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 15,
  },
  contactOptionSelected: {
    backgroundColor: '#FFF0F3',
    borderColor: theme.colors.primary,
  },
  contactOptionText: {
    color: '#666',
    fontSize: 16,
    marginLeft: 15,
  },
  contactOptionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 30,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  redFlagItem: {
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
  },
  redFlagText: {
    color: '#333',
    flex: 1,
    fontSize: 14,
  },
  scoreCircle: {
    alignItems: 'center',
    borderRadius: 60,
    borderWidth: 4,
    height: 120,
    justifyContent: 'center',
    marginBottom: 10,
    width: 120,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  scrollView: {
    maxHeight: 500,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  severityBadge: {
    borderRadius: 4,
    marginRight: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
  },
  tipItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipText: {
    color: '#666',
    flex: 1,
    fontSize: 14,
    marginLeft: 10,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
