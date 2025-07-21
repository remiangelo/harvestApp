import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import useUserStore from '../../stores/useUserStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { LogoutButton } from '../../components/LogoutButton';
import { OptimizedImage } from '../../components/OptimizedImage';
import { LiquidGlassView } from '../../components/liquid/LiquidGlassView';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser, updateOnboardingData } = useUserStore();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState({
    name: 'John Doe',
    age: 25,
    bio: 'I love hiking, photography, and good coffee. Looking for meaningful connections.',
    photos: [null, null, null, null, null, null] as (string | null)[],
    hobbies: ['Photography', 'Hiking', 'Coffee'],
    location: 'San Francisco, CA',
  });

  // Update profile with current user data
  useEffect(() => {
    if (currentUser) {
      // Handle age properly - it could be a number, string, or Date
      let age = 25; // default
      if (currentUser.age) {
        if (typeof currentUser.age === 'number') {
          age = currentUser.age;
        } else if (currentUser.age instanceof Date) {
          age = new Date().getFullYear() - currentUser.age.getFullYear();
        } else if (typeof currentUser.age === 'string') {
          const birthDate = new Date(currentUser.age);
          if (!isNaN(birthDate.getTime())) {
            age = new Date().getFullYear() - birthDate.getFullYear();
          }
        }
      }

      setProfile({
        name: currentUser.nickname || currentUser.name || 'User',
        age,
        bio:
          currentUser.bio ||
          'I love hiking, photography, and good coffee. Looking for meaningful connections.',
        photos: currentUser.photos
          ? [...currentUser.photos, ...Array(Math.max(0, 6 - currentUser.photos.length)).fill(null)]
          : [null, null, null, null, null, null],
        hobbies: currentUser.hobbies || ['Photography', 'Hiking', 'Coffee'],
        location: currentUser.location || 'San Francisco, CA',
      });
    }
  }, [currentUser]);

  const pickImage = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
      const newPhotos = [...profile.photos];
      newPhotos[index] = result.assets[0].uri as string;
      setProfile({ ...profile, photos: newPhotos });

      // Update user context
      const validPhotos = newPhotos.filter((photo) => photo !== null) as string[];
      updateOnboardingData({ photos: validPhotos });
    }
  };

  const handleSave = () => {
    // Save profile to user context
    updateOnboardingData({
      nickname: profile.name,
      bio: profile.bio,
      hobbies: profile.hobbies,
      location: profile.location,
    });
    setIsEditing(false);
  };

  const firstPhoto = profile.photos.find(photo => photo) || null;

  return (
    <View style={styles.container}>
      {/* Gradient Background Header */}
      <LinearGradient colors={['#A0354E', '#8B1E2D', '#701625']} style={styles.headerGradient}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/settings' as any)}>
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
            >
              <Ionicons name={isEditing ? 'checkmark' : 'create-outline'} size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Profile Header Card */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.mainPhotoContainer}
            onPress={() => isEditing && pickImage(0)}
            disabled={!isEditing}
          >
            {firstPhoto ? (
              <OptimizedImage
                source={{ uri: firstPhoto }}
                style={styles.mainPhoto}
                showLoadingIndicator={true}
              />
            ) : (
              <View style={styles.emptyMainPhoto}>
                <Ionicons name="camera" size={40} color="white" />
              </View>
            )}
            {isEditing && (
              <View style={styles.editPhotoOverlay}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.profileName}>{profile.name}, {profile.age}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.profileLocation}>{profile.location}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Bio Section */}
        <LiquidGlassView
          intensity={85}
          tint="light"
          style={styles.bioSection}
          borderRadius={20}
          glassTint="rgba(255, 255, 255, 0.95)"
        >
          <Text style={styles.sectionTitle}>About Me</Text>
          {isEditing ? (
            <TextInput
              style={styles.bioInput}
              value={profile.bio}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Tell us about yourself..."
              placeholderTextColor="#999"
            />
          ) : (
            <Text style={styles.bioText}>{profile.bio}</Text>
          )}
        </LiquidGlassView>

        {/* Photos Grid */}
        <LiquidGlassView
          intensity={85}
          tint="light"
          style={styles.photosSection}
          borderRadius={20}
          glassTint="rgba(255, 255, 255, 0.95)"
        >
          <Text style={styles.sectionTitle}>My Photos</Text>
          <View style={styles.photosGrid}>
            {profile.photos.slice(1).map((photo, index) => (
              <TouchableOpacity
                key={index + 1}
                style={[styles.photoSlot, photo && styles.filledSlot]}
                onPress={() => isEditing && pickImage(index + 1)}
                disabled={!isEditing}
              >
                {photo ? (
                  <OptimizedImage
                    source={{ uri: photo }}
                    style={styles.photo}
                    showLoadingIndicator={true}
                  />
                ) : (
                  <View style={styles.emptyPhoto}>
                    <Ionicons name="add" size={28} color={theme.colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </LiquidGlassView>

        {/* Hobbies Section */}
        <LiquidGlassView
          intensity={85}
          tint="light"
          style={styles.hobbiesSection}
          borderRadius={20}
          glassTint="rgba(255, 255, 255, 0.95)"
        >
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.hobbiesContainer}>
            {profile.hobbies.map((hobby, index) => (
              <LinearGradient
                key={index}
                colors={['#A0354E', '#8B1E2D']}
                style={styles.hobbyTag}
              >
                <Text style={styles.hobbyText}>{hobby}</Text>
              </LinearGradient>
            ))}
          </View>
        </LiquidGlassView>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/profile-edit' as any)}
          >
            <LinearGradient
              colors={['#A0354E', '#8B1E2D']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="pencil" size={20} color="white" />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/settings' as any)}
          >
            <LinearGradient
              colors={['#666', '#444']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="settings" size={20} color="white" />
              <Text style={styles.actionButtonText}>Settings</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <LogoutButton fullWidth />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bioInput: {
    color: '#222',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bioSection: {
    marginBottom: 16,
    marginHorizontal: 16,
    marginTop: -40,
    padding: 20,
  },
  bioText: {
    color: '#444',
    fontSize: 16,
    lineHeight: 24,
  },
  container: {
    backgroundColor: '#F5F5F5',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  editPhotoOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    bottom: 10,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    width: 40,
  },
  emptyMainPhoto: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  emptyPhoto: {
    alignItems: 'center',
    backgroundColor: 'rgba(160, 53, 78, 0.1)',
    flex: 1,
    justifyContent: 'center',
  },
  filledSlot: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerGradient: {
    paddingBottom: 60,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hobbiesSection: {
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 20,
  },
  hobbyTag: {
    borderRadius: 20,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  hobbyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  logoutContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  mainPhoto: {
    height: '100%',
    width: '100%',
  },
  mainPhotoContainer: {
    borderRadius: 70,
    borderWidth: 3,
    borderColor: 'white',
    height: 140,
    marginBottom: 16,
    overflow: 'hidden',
    width: 140,
  },
  photo: {
    height: '100%',
    width: '100%',
  },
  photoSlot: {
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    width: '31%',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photosSection: {
    marginBottom: 16,
    marginHorizontal: 16,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  profileLocation: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginLeft: 4,
  },
  profileName: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#222',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});