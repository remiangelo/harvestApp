import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useUserStore from '../../stores/useUserStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { LogoutButton } from '../../components/LogoutButton';
import { OptimizedImage } from '../../components/OptimizedImage';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
        >
          <Ionicons name={isEditing ? 'checkmark' : 'pencil'} size={20} color="#8B1E2D" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <View style={styles.photosGrid}>
            {profile.photos.map((photo, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.photoSlot, photo && styles.filledSlot]}
                onPress={() => isEditing && pickImage(index)}
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
                    <Ionicons name="camera" size={24} color="#ccc" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={profile.name}
                onChangeText={(text) => setProfile({ ...profile, name: text })}
              />
            ) : (
              <Text style={styles.value}>{profile.name}</Text>
            )}
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Age:</Text>
            <Text style={styles.value}>{profile.age}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>{profile.location}</Text>
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          {isEditing ? (
            <TextInput
              style={styles.bioInput}
              value={profile.bio}
              onChangeText={(text) => setProfile({ ...profile, bio: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.bioText}>{profile.bio}</Text>
          )}
        </View>

        {/* Hobbies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hobbies & Interests</Text>
          <View style={styles.hobbiesContainer}>
            {profile.hobbies.map((hobby, index) => (
              <View key={index} style={styles.hobbyTag}>
                <Text style={styles.hobbyText}>{hobby}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/settings' as any)}
          >
            <Text style={styles.settingText}>App Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingItem, styles.resetButton]}
            onPress={() => {
              // Reset to original demo data
              if (currentUser) {
                // Reuse the same age calculation logic
                let age = 25;
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
                    ? [
                        ...currentUser.photos,
                        ...Array(Math.max(0, 6 - currentUser.photos.length)).fill(null),
                      ]
                    : [null, null, null, null, null, null],
                  hobbies: currentUser.hobbies || ['Photography', 'Hiking', 'Coffee'],
                  location: currentUser.location || 'San Francisco, CA',
                });
                setIsEditing(false);
              }
            }}
          >
            <Text style={[styles.settingText, styles.resetText]}>Reset Demo Data</Text>
            <Ionicons name="refresh" size={20} color="#8B1E2D" />
          </TouchableOpacity>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <LogoutButton fullWidth />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bioInput: {
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
    padding: 12,
    textAlignVertical: 'top',
  },
  bioText: {
    color: '#555',
    fontSize: 16,
    lineHeight: 24,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  editButton: {
    padding: 8,
  },
  emptyPhoto: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  filledSlot: {
    borderColor: '#8B1E2D',
    borderWidth: 2,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hobbyTag: {
    backgroundColor: '#8B1E2D',
    borderRadius: 16,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hobbyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  input: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    color: '#222',
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  label: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
    width: 80,
  },
  logoutContainer: {
    marginBottom: 24,
    marginTop: 24,
  },
  photo: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  photoSlot: {
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    width: '30%',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resetButton: {
    borderBottomColor: '#8B1E2D',
    borderBottomWidth: 2,
  },
  resetText: {
    color: '#8B1E2D',
    fontWeight: '600',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    alignItems: 'center',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingText: {
    color: '#222',
    fontSize: 16,
  },
  title: {
    color: '#8B1E2D',
    fontSize: 24,
    fontWeight: 'bold',
  },
  value: {
    color: '#222',
    flex: 1,
    fontSize: 16,
  },
});
