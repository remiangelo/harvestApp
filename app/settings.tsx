import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { useAuthStore } from '../stores/useAuthStore';
import useUserStore from '../stores/useUserStore';
import { LogoutButton } from '../components/LogoutButton';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentUser, updateOnboardingData } = useUserStore();
  
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    likes: true,
    superLikes: true,
    promotions: false,
  });
  
  const [privacy, setPrivacy] = useState({
    showLocation: true,
    showAge: true,
    showActiveStatus: true,
    readReceipts: true,
  });

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyToggle = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
            router.replace('/login');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/profile-edit' as any)}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="person-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Verify Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="card-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Subscription & Billing</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="heart-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>New Matches</Text>
            </View>
            <Switch
              value={notifications.matches}
              onValueChange={() => handleNotificationToggle('matches')}
              trackColor={{ false: '#ccc', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubble-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Messages</Text>
            </View>
            <Switch
              value={notifications.messages}
              onValueChange={() => handleNotificationToggle('messages')}
              trackColor={{ false: '#ccc', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="thumbs-up-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Likes</Text>
            </View>
            <Switch
              value={notifications.likes}
              onValueChange={() => handleNotificationToggle('likes')}
              trackColor={{ false: '#ccc', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="star-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Super Likes</Text>
            </View>
            <Switch
              value={notifications.superLikes}
              onValueChange={() => handleNotificationToggle('superLikes')}
              trackColor={{ false: '#ccc', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="location-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Show My Location</Text>
            </View>
            <Switch
              value={privacy.showLocation}
              onValueChange={() => handlePrivacyToggle('showLocation')}
              trackColor={{ false: '#ccc', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Show My Age</Text>
            </View>
            <Switch
              value={privacy.showAge}
              onValueChange={() => handlePrivacyToggle('showAge')}
              trackColor={{ false: '#ccc', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="wifi-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Show Active Status</Text>
            </View>
            <Switch
              value={privacy.showActiveStatus}
              onValueChange={() => handlePrivacyToggle('showActiveStatus')}
              trackColor={{ false: '#ccc', true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="flag-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Report a Problem</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.primary} />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.settingItem, styles.dangerItem]}
            onPress={handleDeleteAccount}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="trash-outline" size={20} color="#e74c3c" />
              <Text style={[styles.settingText, styles.dangerText]}>Delete Account</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.logoutSection}>
          <LogoutButton fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginLeft: 12,
  },
  dangerItem: {
    borderBottomColor: '#ffecec',
  },
  dangerText: {
    color: '#e74c3c',
  },
  logoutSection: {
    marginTop: 32,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
});