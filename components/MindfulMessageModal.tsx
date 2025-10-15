import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LiquidGlassView } from './liquid/LiquidGlassView';
import { theme } from '../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface MindfulMessageModalProps {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSendAnyway: () => void;
  reason: string;
  growthLesson: string;
  severity: 'low' | 'medium' | 'high';
}

export const MindfulMessageModal: React.FC<MindfulMessageModalProps> = ({
  visible,
  onClose,
  onEdit,
  onSendAnyway,
  reason,
  growthLesson,
  severity,
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'high':
        return '#D32F2F';
      case 'medium':
        return '#F57C00';
      case 'low':
        return '#FFA726';
      default:
        return theme.colors.primary;
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'high':
        return 'alert-circle';
      case 'medium':
        return 'warning';
      case 'low':
        return 'information-circle';
      default:
        return 'information-circle';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <BlurView intensity={80} tint="dark" style={styles.backdrop}>
        <View style={styles.darkOverlay} />

        <View style={styles.modalContainer}>
          <LiquidGlassView
            intensity={70}
            tint="light"
            style={styles.contentContainer as any}
            borderRadius={24}
            glassTint="rgba(255, 255, 255, 0.98)"
          >
            {/* Icon Header */}
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, { backgroundColor: getSeverityColor() }]}>
                <Ionicons name={getSeverityIcon()} size={48} color="white" />
              </View>
            </View>

            {/* Title */}
            <Text style={styles.title}>Would you like to rethink this message?</Text>

            {/* Reason */}
            <View style={styles.reasonContainer}>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>

            {/* Growth Lesson */}
            <View style={styles.lessonContainer}>
              <View style={styles.lessonHeader}>
                <Ionicons name="leaf" size={20} color={theme.colors.primary} />
                <Text style={styles.lessonTitle}>Growth Moment</Text>
              </View>

              <ScrollView
                style={styles.lessonScroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.lessonScrollContent}
              >
                <Text style={styles.lessonText}>{growthLesson}</Text>
              </ScrollView>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              {/* Edit Button (Primary) */}
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={onEdit}
                activeOpacity={0.7}
              >
                <Ionicons name="create-outline" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Edit Message</Text>
              </TouchableOpacity>

              {/* Secondary Actions */}
              <View style={styles.secondaryButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={onSendAnyway}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>Send Anyway</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Settings Note */}
            <Text style={styles.settingsNote}>You can disable this feature in Settings</Text>
          </LiquidGlassView>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  button: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 24,
    width: '100%',
  },
  contentContainer: {
    maxWidth: screenWidth - 40,
    padding: 24,
    width: '100%',
  },
  darkOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  lessonContainer: {
    backgroundColor: 'rgba(160, 53, 78, 0.05)',
    borderColor: 'rgba(160, 53, 78, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  lessonHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  lessonScroll: {
    maxHeight: 150,
  },
  lessonScrollContent: {
    paddingBottom: 4,
  },
  lessonText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  lessonTitle: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  reasonContainer: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderColor: 'rgba(255, 152, 0, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  reasonText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    flex: 1,
  },
  secondaryButtonText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  settingsNote: {
    color: theme.colors.text.tertiary,
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
