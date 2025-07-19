import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';

const MAX_PHOTOS = 6;

export default function OnboardingPhotos() {
  const [photos, setPhotos] = useState<(string | null)[]>(Array(MAX_PHOTOS).fill(null));
  const { currentUser } = useUserStore();

  // Pre-fill with demo data if available
  useEffect(() => {
    if (currentUser?.photos) {
      const demoPhotos = [...currentUser.photos];
      // Fill remaining slots with null
      while (demoPhotos.length < MAX_PHOTOS) {
        demoPhotos.push(null as any);
      }
      setPhotos(demoPhotos.slice(0, MAX_PHOTOS));
    }
  }, [currentUser]);

  const pickImage = async (index: number) => {
    try {
      // Starting image picker
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      // Permission status checked
      
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      // Launching image library
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      // Image picker result received
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhotos = [...photos];
        newPhotos[index] = result.assets[0].uri;
        setPhotos(newPhotos);
        // Photo added successfully
      } else {
        // Image picker was canceled
      }
    } catch (error) {
      console.error('Error in pickImage:', error);
      alert('Error picking image: ' + (error as Error).message);
    }
  };

  const handleValidate = () => {
    const validPhotos = photos.filter(photo => photo !== null) as string[];
    if (validPhotos.length > 0) {
      return { photos: validPhotos };
    }
    return null;
  };

  return (
    <OnboardingScreen
      progress={80}
      currentStep="photos"
      nextStep="hobbies"
      onValidate={handleValidate}
      buttonDisabled={photos.every(p => !p)}
    >
      <KeyboardAvoidingView style={{ flex: 1, width: '100%' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Show your Best Self</Text>
        <Text style={styles.subtitle}>Upload up to six of your best photos to make a fantastic first impression. Let your personality shine.</Text>
        <View style={styles.grid}>
          {photos.map((photo, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.photoSlot, photo && styles.filledSlot]}
              onPress={() => pickImage(idx)}
              activeOpacity={0.7}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} />
              ) : (
                <Text style={styles.plus}>+</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </KeyboardAvoidingView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'System',
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  photoSlot: {
    width: '30%',
    aspectRatio: 2/3,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: '1.5%',
    overflow: 'hidden',
  },
  filledSlot: {
    borderColor: '#8B1E2D',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  plus: {
    fontSize: 36,
    color: '#8B1E2D',
    fontWeight: 'bold',
  },
}); 