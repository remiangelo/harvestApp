import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlassView } from './liquid/LiquidGlassView';

interface ChatMenuPopupProps {
  visible: boolean;
  onClose: () => void;
  matchName: string;
  matchPhoto: string;
  isActive: boolean;
  onShareProfile: () => void;
  onToggleReady: (value: boolean) => void;
  onGardenerAI: () => void;
  onReportProfile: () => void;
  onUnmatch: () => void;
}

export const ChatMenuPopup: React.FC<ChatMenuPopupProps> = ({
  visible,
  onClose,
  matchName,
  matchPhoto,
  isActive,
  onShareProfile,
  onToggleReady,
  onGardenerAI,
  onReportProfile,
  onUnmatch,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFillObject} />

        <View style={styles.container}>
          <LiquidGlassView
            intensity={90}
            tint="light"
            style={styles.menuContainer}
            borderRadius={20}
            glassTint="rgba(255, 255, 255, 0.05)"
          >
            {/* Header */}
            <View style={styles.header}>
              <Image source={{ uri: matchPhoto }} style={styles.avatar} />
              <View style={styles.headerInfo}>
                <Text style={styles.name}>{matchName}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, isActive && styles.activeDot]} />
                  <Text style={styles.statusText}>{isActive ? 'Active' : 'Offline'}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuItems}>
              {/* Share Profile */}
              <TouchableOpacity style={styles.menuItem} onPress={onShareProfile}>
                <View style={styles.menuIconContainer}>
                  <View style={styles.harvestIcon}>
                    <Text style={styles.harvestIconText}>H</Text>
                  </View>
                </View>
                <Text style={styles.menuItemText}>Share Profile?</Text>
                <Ionicons name="share-outline" size={20} color="#666" />
              </TouchableOpacity>

              {/* Ready to move */}
              <View style={styles.menuItem}>
                <Text style={styles.menuItemText}>Ready to move?</Text>
                <Switch
                  value={false}
                  onValueChange={onToggleReady}
                  trackColor={{ false: '#E5E5E5', true: '#A0354E' }}
                  thumbColor="white"
                />
              </View>

              {/* Gardener AI */}
              <TouchableOpacity style={styles.menuItem} onPress={onGardenerAI}>
                <Text style={styles.menuItemText}>Gardener AI</Text>
              </TouchableOpacity>

              {/* Report Profile */}
              <TouchableOpacity style={styles.menuItem} onPress={onReportProfile}>
                <Text style={styles.menuItemText}>Report Profile</Text>
              </TouchableOpacity>

              {/* Unmatch */}
              <TouchableOpacity style={styles.menuItem} onPress={onUnmatch}>
                <Text style={[styles.menuItemText, styles.unmatchText]}>Unmatch</Text>
              </TouchableOpacity>
            </View>
          </LiquidGlassView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: '#34C759',
  },
  avatar: {
    borderRadius: 25,
    height: 50,
    marginRight: 12,
    width: 50,
  },
  backdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  closeButton: {
    padding: 8,
  },
  container: {
    maxWidth: 340,
    width: '85%',
  },
  harvestIcon: {
    alignItems: 'center',
    backgroundColor: '#A0354E',
    borderRadius: 8,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  harvestIconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 20,
  },
  headerInfo: {
    flex: 1,
  },
  menuContainer: {
    padding: 20,
  },
  menuIconContainer: {
    marginRight: 12,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    paddingVertical: 15,
  },
  menuItemText: {
    color: '#1a1a1a',
    flex: 1,
    fontSize: 16,
  },
  menuItems: {
    gap: 5,
  },
  name: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusDot: {
    backgroundColor: '#ccc',
    borderRadius: 4,
    height: 8,
    marginRight: 6,
    width: 8,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statusText: {
    color: '#666',
    fontSize: 14,
  },
  unmatchText: {
    color: '#FF3B30',
  },
});
