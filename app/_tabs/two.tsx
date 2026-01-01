import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import useUserStore from '../../stores/useUserStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { OptimizedImage } from '../../components/OptimizedImage';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser, updateOnboardingData } = useUserStore();
  useAuthStore();

  // Animation values for header
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 1], // Always fully visible - no fade out
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 0], // No movement - always in same position
    extrapolate: 'clamp',
  });

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
      try {
        if (currentUser.age) {
          if (typeof currentUser.age === 'number') {
            age = currentUser.age;
          } else if (currentUser.age instanceof Date) {
            age = new Date().getFullYear() - currentUser.age.getFullYear();
          } else if (typeof currentUser.age === 'string') {
            // Try to parse as date string
            const birthDate = new Date(currentUser.age);
            if (!isNaN(birthDate.getTime())) {
              age = new Date().getFullYear() - birthDate.getFullYear();
            } else if (/^\d+$/.test(currentUser.age)) {
              // If it's just a number as string
              age = parseInt(currentUser.age, 10);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to parse age:', error);
        // Keep default age of 25
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

  const firstPhoto = profile.photos.find((photo) => photo) || null;

  // Memoize the additional photos array to prevent re-renders
  const additionalPhotos = useMemo(() => {
    return profile.photos.slice(1);
  }, [profile.photos]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Minimal Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerOpacity,
              transform: [{ translateY: headerTranslateY }],
              paddingTop: insets.top + 12,
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => (isEditing ? handleSave() : setIsEditing(true))}>
            <Ionicons name={isEditing ? 'checkmark' : 'create-outline'} size={24} color="#333" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 56 + 20 }}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true,
            listener: (_event: NativeSyntheticEvent<NativeScrollEvent>) => {
              // Notify tab bar about scroll - but keep tab bar always visible for profile
              (globalThis as { handleTabBarScroll?: (y: number) => void }).handleTabBarScroll?.(0); // Always keep tab bar visible
            },
          })}
          scrollEventThrottle={16}
        >
          {/* Compact Profile Header */}
          <View style={[styles.profileHeader, { paddingTop: insets.top + 60 }]}>
            <View style={styles.profileInfo}>
              <TouchableOpacity
                style={styles.mainPhotoContainer}
                onPress={() => isEditing && pickImage(0)}
                disabled={!isEditing}
              >
                {firstPhoto ? (
                  <OptimizedImage
                    source={{ uri: firstPhoto }}
                    style={styles.mainPhoto}
                    showLoadingIndicator={false}
                  />
                ) : (
                  <View style={styles.emptyMainPhoto}>
                    <Ionicons name="camera" size={24} color="#999" />
                  </View>
                )}
                {isEditing && (
                  <View style={styles.editPhotoOverlay}>
                    <Ionicons name="camera" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.nameSection}>
                <Text style={styles.profileName}>
                  {profile.name}, {profile.age}
                </Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color="#666" />
                  <Text style={styles.profileLocation}>{profile.location}</Text>
                </View>
              </View>
            </View>
          </View>
          {/* Bio Section */}
          <View style={[styles.bioSection, isEditing && styles.editModeSection]}>
            <Text style={styles.sectionTitle}>About</Text>
            {isEditing ? (
              <TextInput
                style={styles.bioInput}
                value={profile.bio}
                onChangeText={(text) => setProfile({ ...profile, bio: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="Tell us about yourself..."
                placeholderTextColor="#999"
              />
            ) : (
              <Text style={styles.bioText}>{profile.bio}</Text>
            )}
          </View>

          {/* Interests */}
          <View style={[styles.hobbiesSection, isEditing && styles.editModeSection]}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.hobbiesContainer}>
              {profile.hobbies.map((hobby, index) => (
                <View key={index} style={styles.hobbyTag}>
                  <Text style={styles.hobbyText}>{hobby}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Photos Grid */}
          <View style={[styles.photosSection, isEditing && styles.editModeSection]}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.photosGrid}>
              {additionalPhotos.map((photo, index) => (
                <TouchableOpacity
                  key={index + 1}
                  style={styles.photoSlot}
                  onPress={() => isEditing && pickImage(index + 1)}
                  disabled={!isEditing}
                >
                  {photo ? (
                    <OptimizedImage
                      source={{ uri: photo }}
                      style={styles.photo}
                      showLoadingIndicator={false}
                    />
                  ) : (
                    <View style={styles.emptyPhoto}>
                      <Ionicons name="add" size={20} color="#ccc" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/profile-edit')}
            >
              <Text style={styles.actionButtonText}>Edit Full Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.secondaryButtonText}>Account Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => useAuthStore.getState().logout()}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    marginBottom: 12,
    paddingVertical: 14,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  bioInput: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    borderWidth: 1,
    color: '#333',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 66,
    padding: 8,
  },
  bioSection: {
    marginBottom: 4,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  bioText: {
    color: '#333',
    fontSize: 15,
    lineHeight: 22,
  },
  container: {
    backgroundColor: '#FAFAFA',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  editModeSection: {
    backgroundColor: '#fff',
    borderColor: theme.colors.primary,
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 16,
    padding: 16,
  },
  editPhotoOverlay: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    bottom: 5,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 5,
    width: 24,
  },
  emptyMainPhoto: {
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderWidth: 2,
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  emptyPhoto: {
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderWidth: 2,
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  header: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: 20,
    paddingVertical: 12,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hobbiesSection: {
    marginBottom: 4,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  hobbyTag: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  hobbyText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  logoutContainer: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: '#999',
    fontSize: 15,
    fontWeight: '500',
  },
  mainPhoto: {
    height: '100%',
    width: '100%',
  },
  mainPhotoContainer: {
    backgroundColor: '#f0f0f0',
    borderColor: '#fff',
    borderRadius: 40,
    borderWidth: 2,
    height: 80,
    overflow: 'hidden',
    width: 80,
  },
  nameSection: {
    flex: 1,
    marginLeft: 16,
  },
  photo: {
    height: '100%',
    width: '100%',
  },
  photoSlot: {
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    width: (Dimensions.get('window').width - 40 - 16) / 3,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photosSection: {
    marginBottom: 4,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileHeader: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  profileInfo: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  profileLocation: {
    color: '#666',
    fontSize: 14,
    marginLeft: 4,
  },
  profileName: {
    color: '#1a1a1a',
    fontSize: 24,
    fontWeight: '700',
  },
  safeArea: {
    flex: 1,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
});
