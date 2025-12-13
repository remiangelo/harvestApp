import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { RedFlag } from '../../lib/ai/openaiService';
import { getSafetyColor } from '../../lib/ai/safetyConfig';
import { theme } from '../../constants/theme';

interface SafetyWarningProps {
  visible: boolean;
  onClose: () => void;
  safetyScore: number;
  redFlags: RedFlag[];
  recommendations: string[];
  matchName: string;
  onReport?: () => void;
  onBlock?: () => void;
}

export const SafetyWarning: React.FC<SafetyWarningProps> = ({
  visible,
  onClose,
  safetyScore,
  redFlags,
  recommendations,
  matchName,
  onReport,
  onBlock,
}) => {
  const safetyColor = getSafetyColor(safetyScore);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'alert-circle';
      case 'high':
        return 'warning';
      case 'medium':
        return 'information-circle';
      default:
        return 'information-circle-outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#F44336';
      case 'high':
        return '#FF9800';
      case 'medium':
        return '#FFC107';
      default:
        return '#2196F3';
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.container}>
        <BlurView intensity={90} style={StyleSheet.absoluteFillObject} />

        <View style={styles.content}>
          <LinearGradient colors={[safetyColor, safetyColor + 'DD']} style={styles.header}>
            <Ionicons name="shield" size={40} color="white" />
            <Text style={styles.title}>Safety Alert</Text>
            <Text style={styles.subtitle}>Potential concerns detected with {matchName}</Text>
          </LinearGradient>

          <View style={styles.body}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Safety Score</Text>
              <View style={[styles.scoreBar, { backgroundColor: safetyColor + '20' }]}>
                <View
                  style={[
                    styles.scoreBarFill,
                    {
                      backgroundColor: safetyColor,
                      width: `${safetyScore}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.scoreText, { color: safetyColor }]}>{safetyScore}/100</Text>
            </View>

            {redFlags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚠️ Warning Signs</Text>
                {redFlags.map((flag, index) => (
                  <View key={index} style={styles.flagItem}>
                    <Ionicons
                      name={getSeverityIcon(flag.severity)}
                      size={24}
                      color={getSeverityColor(flag.severity)}
                    />
                    <View style={styles.flagContent}>
                      <Text style={styles.flagMessage}>{flag.message}</Text>
                      {flag.evidence && (
                        <Text style={styles.flagEvidence}>&quot;{flag.evidence}&quot;</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {recommendations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💡 Recommendations</Text>
                {recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.recommendationText}>• {rec}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={onClose}>
                <Text style={styles.actionButtonText}>I Understand</Text>
              </TouchableOpacity>

              <View style={styles.secondaryActions}>
                {onReport && (
                  <TouchableOpacity style={styles.secondaryButton} onPress={onReport}>
                    <Ionicons name="flag" size={20} color="#FF9800" />
                    <Text style={styles.secondaryButtonText}>Report</Text>
                  </TouchableOpacity>
                )}

                {onBlock && (
                  <TouchableOpacity style={styles.secondaryButton} onPress={onBlock}>
                    <Ionicons name="ban" size={20} color="#F44336" />
                    <Text style={styles.secondaryButtonText}>Block</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    padding: 15,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    marginTop: 20,
  },
  body: {
    padding: 20,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 5,
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    width: '100%',
  },
  flagContent: {
    flex: 1,
    marginLeft: 10,
  },
  flagEvidence: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  flagItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 12,
  },
  flagMessage: {
    color: '#333',
    fontSize: 14,
    marginBottom: 4,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  recommendationItem: {
    marginBottom: 8,
  },
  recommendationText: {
    color: '#666',
    fontSize: 14,
  },
  scoreBar: {
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
  },
  scoreContainer: {
    marginBottom: 20,
  },
  scoreLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 5,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    marginTop: 15,
  },
  secondaryButton: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 14,
    marginLeft: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
