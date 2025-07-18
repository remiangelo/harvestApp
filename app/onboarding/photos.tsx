import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useUser } from '../../context/UserContext';

const MAX_PHOTOS = 6;

export default function OnboardingPhotos() {
  const [photos, setPhotos] = useState<(string | null)[]>(Array(MAX_PHOTOS).fill(null));
  const router = useRouter();
  const { currentUser, updateOnboardingData } = useUser();

  // Pre-fill with demo data if available
  useEffect(() => {
    if (currentUser?.photos) {
      const demoPhotos = [...currentUser.photos];
      // Fill remaining slots with null
      while (demoPhotos.length < MAX_PHOTOS) {
        demoPhotos.push(null);
      }
      setPhotos(demoPhotos.slice(0, MAX_PHOTOS));
    }
  }, [currentUser]);

  const pickImage = async (index: number) => {
    try {
      console.log('Starting image picker for index:', index);
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
      
      console.log('Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      console.log('Image picker result:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhotos = [...photos];
        newPhotos[index] = result.assets[0].uri;
        setPhotos(newPhotos);
        console.log('Photo added successfully:', result.assets[0].uri);
      } else {
        console.log('Image picker was canceled or no assets returned');
      }
    } catch (error) {
      console.error('Error in pickImage:', error);
      alert('Error picking image: ' + error.message);
    }
  };

  const handleContinue = () => {
    // Save photos to user context (filter out null values)
    const validPhotos = photos.filter(photo => photo !== null) as string[];
    updateOnboardingData({ photos: validPhotos });
    router.push('/onboarding/hobbies');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '80%' }]} />
        </View>
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
                  <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={photos.every(p => !p)}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#8B1E2D',
    borderRadius: 4,
  },
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
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#8B1E2D',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    opacity: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
}); 