import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import useUserStore from '../../stores/useUserStore';
import { OnboardingScreen } from '../../components/OnboardingScreen';
import { PhotoUploadSlot } from '../../components/PhotoUploadSlot';
import { useAuthStore } from '../../stores/useAuthStore';
import { uploadPhoto, deletePhoto } from '../../lib/profiles';

const MAX_PHOTOS = 6;

export default function OnboardingPhotos() {
  const [photos, setPhotos] = useState<(string | null)[]>(Array(MAX_PHOTOS).fill(null));
  const [uploadingIndexes, setUploadingIndexes] = useState<Set<number>>(new Set());
  const [failedUploads, setFailedUploads] = useState<Set<number>>(new Set());
  const { onboardingData, currentUser } = useUserStore();
  const { user, isTestMode } = useAuthStore();

  // Pre-fill with restored data if available
  useEffect(() => {
    if (onboardingData?.photos) {
      const restoredPhotos = [...onboardingData.photos];
      // Fill remaining slots with null
      while (restoredPhotos.length < MAX_PHOTOS) {
        restoredPhotos.push(null as any);
      }
      setPhotos(restoredPhotos.slice(0, MAX_PHOTOS));
    }
  }, [onboardingData]);

  const handlePhotoSelected = async (uri: string, index: number) => {
    if (!user) {
      Alert.alert('Error', 'Please log in to upload photos');
      return;
    }

    // Update local state immediately
    const newPhotos = [...photos];
    const oldPhoto = newPhotos[index];
    newPhotos[index] = uri;
    setPhotos(newPhotos);

    // In test mode, just save the local URI
    if (isTestMode) {
      // No upload needed in test mode, photos stay local
      return;
    }

    // Mark as uploading
    setUploadingIndexes(prev => new Set(prev).add(index));

    try {
      // Delete old photo if it exists and is a cloud URL
      if (oldPhoto && oldPhoto.startsWith('http')) {
        await deletePhoto(oldPhoto);
      }

      // Upload new photo to Supabase Storage
      const userId = user?.id || currentUser?.id;
      if (!userId) {
        throw new Error('No user ID available for upload');
      }
      
      const { url, error } = await uploadPhoto(userId, uri, index);
      
      if (error || !url) {
        throw error || new Error('Failed to upload photo');
      }

      // Update with cloud URL
      setPhotos(prev => {
        const updated = [...prev];
        updated[index] = url;
        return updated;
      });
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert(
        'Upload Failed', 
        'Failed to upload photo. It will be saved when you continue.',
        [{ text: 'OK' }]
      );
      // Keep the local URI - it will be uploaded when saving the step
      setFailedUploads(prev => new Set(prev).add(index));
    } finally {
      // Remove from uploading set
      setUploadingIndexes(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const handleValidate = () => {
    const validPhotos = photos.filter(photo => photo !== null) as string[];
    if (validPhotos.length > 0) {
      return { photos: validPhotos };
    }
    return null;
  };

  const isAnyUploading = uploadingIndexes.size > 0;
  const hasPhotos = photos.some(p => p !== null);

  return (
    <OnboardingScreen
      progress={80}
      currentStep="photos"
      nextStep="hobbies"
      onValidate={handleValidate}
      buttonDisabled={!hasPhotos || isAnyUploading}
    >
      <KeyboardAvoidingView style={{ flex: 1, width: '100%' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Show your Best Self</Text>
        <Text style={styles.subtitle}>Upload up to six of your best photos to make a fantastic first impression. Let your personality shine.</Text>
        <View style={styles.grid}>
          {photos.map((photo, idx) => (
            <PhotoUploadSlot
              key={idx}
              photo={photo}
              index={idx}
              onPhotoSelected={handlePhotoSelected}
              isUploading={uploadingIndexes.has(idx)}
            />
          ))}
        </View>

        {isAnyUploading && (
          <Text style={styles.uploadingMessage}>
            Uploading photos... Please wait
          </Text>
        )}
        
        {failedUploads.size > 0 && (
          <Text style={styles.errorMessage}>
            {failedUploads.size} photo{failedUploads.size > 1 ? 's' : ''} failed to upload. They will be saved when you continue.
          </Text>
        )}
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
  uploadingMessage: {
    textAlign: 'center',
    color: '#8B1E2D',
    fontSize: 14,
    marginTop: -16,
    marginBottom: 16,
  },
  errorMessage: {
    textAlign: 'center',
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: -16,
    marginBottom: 16,
  },
}); 