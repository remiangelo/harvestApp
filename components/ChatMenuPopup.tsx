import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  Image,
} from 'react-native';
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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      >
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
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 340,
  },
  menuContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginRight: 6,
  },
  activeDot: {
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 8,
  },
  menuItems: {
    gap: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  menuIconContainer: {
    marginRight: 12,
  },
  harvestIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#A0354E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  harvestIconText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
  },
  unmatchText: {
    color: '#FF3B30',
  },
});