import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useUserStore from '../../stores/useUserStore';
import { useAuthStore } from '../../stores/useAuthStore';

export default function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser, updateOnboardingData } = useUserStore();
  const { user } = useAuthStore();
  
  const [profile, setProfile] = useState({
    name: 'John Doe',
    age: 25,
    bio: 'I love hiking, photography, and good coffee. Looking for meaningful connections.',
    photos: [null, null, null, null, null, null],
    hobbies: ['Photography', 'Hiking', 'Coffee'],
    location: 'San Francisco, CA'
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
        bio: currentUser.bio || 'I love hiking, photography, and good coffee. Looking for meaningful connections.',
        photos: currentUser.photos ? [...currentUser.photos, ...Array(Math.max(0, 6 - currentUser.photos.length)).fill(null)] : [null, null, null, null, null, null],
        hobbies: currentUser.hobbies || ['Photography', 'Hiking', 'Coffee'],
        location: currentUser.location || 'San Francisco, CA'
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
      const newPhotos = [...profile.photos];
      newPhotos[index] = result.assets[0].uri || null;
      setProfile({ ...profile, photos: newPhotos });
      
      // Update user context
      const validPhotos = newPhotos.filter(photo => photo !== null) as string[];
      updateOnboardingData({ photos: validPhotos });
    }
  };

  const handleSave = () => {
    // Save profile to user context
    updateOnboardingData({
      nickname: profile.name,
      bio: profile.bio,
      hobbies: profile.hobbies,
      location: profile.location
    });
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => isEditing ? handleSave() : setIsEditing(true)}
        >
          <Ionicons 
            name={isEditing ? "checkmark" : "pencil"} 
            size={20} 
            color="#8B1E2D" 
          />
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
                  <Image source={{ uri: photo }} style={styles.photo} />
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
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Privacy Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Notification Preferences</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Account Settings</Text>
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
                  bio: currentUser.bio || 'I love hiking, photography, and good coffee. Looking for meaningful connections.',
                  photos: currentUser.photos ? [...currentUser.photos, ...Array(Math.max(0, 6 - currentUser.photos.length)).fill(null)] : [null, null, null, null, null, null],
                  hobbies: currentUser.hobbies || ['Photography', 'Hiking', 'Coffee'],
                  location: currentUser.location || 'San Francisco, CA'
                });
                setIsEditing(false);
              }
            }}
          >
            <Text style={[styles.settingText, styles.resetText]}>Reset Demo Data</Text>
            <Ionicons name="refresh" size={20} color="#8B1E2D" />
          </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B1E2D',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoSlot: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  filledSlot: {
    borderWidth: 2,
    borderColor: '#8B1E2D',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyPhoto: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    width: 80,
  },
  value: {
    fontSize: 16,
    color: '#222',
    flex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 4,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  bioText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  hobbyTag: {
    backgroundColor: '#8B1E2D',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  hobbyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: '#222',
  },
  resetButton: {
    borderBottomColor: '#8B1E2D',
    borderBottomWidth: 2,
  },
  resetText: {
    color: '#8B1E2D',
    fontWeight: '600',
  },
});
