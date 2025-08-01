import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../constants/theme';
import { useAuthStore } from '../stores/useAuthStore';
import useUserStore from '../stores/useUserStore';
import { updateProfile, uploadPhoto, deletePhoto } from '../lib/profiles';
import { OptimizedImage } from '../components/OptimizedImage';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Chip } from '../components/ui/Chip';

const AVAILABLE_HOBBIES = [
  'Photography',
  'Hiking',
  'Coffee',
  'Travel',
  'Reading',
  'Music',
  'Cooking',
  'Art',
  'Yoga',
  'Gaming',
  'Movies',
  'Dancing',
  'Sports',
  'Writing',
  'Nature',
  'Fitness',
  'Meditation',
  'Wine',
];

export default function ProfileEditScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentUser, updateOnboardingData } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null);

  const [profile, setProfile] = useState({
    nickname: '',
    bio: '',
    photos: [] as (string | null)[],
    hobbies: [] as string[],
    location: '',
    age: 25,
  });

  useEffect(() => {
    if (currentUser) {
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
        nickname: currentUser.nickname || currentUser.name || '',
        bio: currentUser.bio || '',
        photos: currentUser.photos
          ? [...currentUser.photos, ...Array(Math.max(0, 6 - currentUser.photos.length)).fill(null)]
          : Array(6).fill(null),
        hobbies: currentUser.hobbies || [],
        location: currentUser.location || '',
        age,
      });
    }
  }, [currentUser]);

  const pickImage = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri && user) {
      setUploadingPhoto(index);

      try {
        // Delete old photo if replacing
        if (profile.photos[index]) {
          await deletePhoto(profile.photos[index] as string);
        }

        // Upload new photo
        const uploadResult = await uploadPhoto(user.id, result.assets[0].uri, index);

        if (uploadResult?.url) {
          const newPhotos = [...profile.photos];
          newPhotos[index] = uploadResult.url;
          setProfile((prev) => ({ ...prev, photos: newPhotos }));
        }
      } catch (error) {
        Alert.alert('Upload Failed', 'Failed to upload photo. Please try again.');
      } finally {
        setUploadingPhoto(null);
      }
    }
  };

  const removePhoto = async (index: number) => {
    if (profile.photos[index] && user) {
      Alert.alert('Remove Photo', 'Are you sure you want to remove this photo?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhoto(profile.photos[index] as string);
              const newPhotos = [...profile.photos];
              newPhotos[index] = null;
              setProfile((prev) => ({ ...prev, photos: newPhotos }));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove photo.');
            }
          },
        },
      ]);
    }
  };

  const toggleHobby = (hobby: string) => {
    setProfile((prev) => ({
      ...prev,
      hobbies: prev.hobbies.includes(hobby)
        ? prev.hobbies.filter((h) => h !== hobby)
        : [...prev.hobbies, hobby].slice(0, 5), // Max 5 hobbies
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    if (!profile.nickname.trim()) {
      Alert.alert('Required Field', 'Please enter your nickname.');
      return;
    }

    if (!profile.bio.trim()) {
      Alert.alert('Required Field', 'Please write something about yourself.');
      return;
    }

    setSaving(true);

    try {
      // Update profile in database
      const validPhotos = profile.photos.filter((p) => p !== null) as string[];

      const updateData = {
        nickname: profile.nickname.trim(),
        bio: profile.bio.trim(),
        hobbies: profile.hobbies,
        location: profile.location.trim(),
        photos: validPhotos,
      };

      const { error } = await updateProfile(user.id, updateData);

      if (error) {
        throw error;
      }

      // Update local state
      updateOnboardingData(updateData);

      Alert.alert('Profile Updated', 'Your profile has been updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Update Failed', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Photos Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.sectionSubtitle}>Add at least 2 photos</Text>

            <View style={styles.photosGrid}>
              {profile.photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <TouchableOpacity
                    style={[styles.photoSlot, photo && styles.filledSlot]}
                    onPress={() => pickImage(index)}
                    disabled={uploadingPhoto !== null}
                  >
                    {photo ? (
                      <>
                        <OptimizedImage
                          source={{ uri: photo }}
                          style={styles.photo}
                          showLoadingIndicator={false}
                        />
                        <TouchableOpacity
                          style={styles.removePhotoButton}
                          onPress={() => removePhoto(index)}
                        >
                          <Ionicons name="close-circle" size={24} color="#fff" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <View style={styles.emptyPhoto}>
                        {uploadingPhoto === index ? (
                          <ActivityIndicator size="small" color={theme.colors.primary} />
                        ) : (
                          <Ionicons name="add" size={32} color="#ccc" />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                  {index === 0 && <Text style={styles.mainPhotoLabel}>Main Photo</Text>}
                </View>
              ))}
            </View>
          </View>

          {/* Basic Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Info</Text>

            <Input
              label="Nickname"
              value={profile.nickname}
              onChangeText={(text) => setProfile((prev) => ({ ...prev, nickname: text }))}
              placeholder="What should we call you?"
              maxLength={20}
            />

            <Input
              label="Location"
              value={profile.location}
              onChangeText={(text) => setProfile((prev) => ({ ...prev, location: text }))}
              placeholder="City, State"
              leftIcon={<Ionicons name="location-outline" size={20} color="#666" />}
            />
          </View>

          {/* Bio Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Me</Text>

            <TextInput
              style={styles.bioInput}
              value={profile.bio}
              onChangeText={(text) => setProfile((prev) => ({ ...prev, bio: text }))}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{profile.bio.length}/500</Text>
          </View>

          {/* Hobbies Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hobbies & Interests</Text>
            <Text style={styles.sectionSubtitle}>Select up to 5</Text>

            <View style={styles.hobbiesGrid}>
              {AVAILABLE_HOBBIES.map((hobby) => (
                <TouchableOpacity
                  key={hobby}
                  onPress={() => toggleHobby(hobby)}
                  disabled={!profile.hobbies.includes(hobby) && profile.hobbies.length >= 5}
                >
                  <Chip label={hobby} selected={profile.hobbies.includes(hobby)} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.bottomSection}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
              disabled={saving || !profile.nickname.trim() || !profile.bio.trim()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bioInput: {
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 1,
    color: theme.colors.text.primary,
    fontSize: 16,
    minHeight: 120,
    padding: 16,
    textAlignVertical: 'top',
  },
  bottomSection: {
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  charCount: {
    color: theme.colors.text.tertiary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  emptyPhoto: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  filledSlot: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  hobbiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  mainPhotoLabel: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  photo: {
    height: '100%',
    width: '100%',
  },
  photoContainer: {
    padding: 4,
    width: '33.333%',
  },
  photoSlot: {
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  removePhotoButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    position: 'absolute',
    right: 8,
    top: 8,
  },
  saveButton: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionSubtitle: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  title: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
});
