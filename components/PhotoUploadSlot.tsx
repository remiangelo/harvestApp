import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../constants/theme';

interface PhotoUploadSlotProps {
  photo: string | null;
  index: number;
  onPhotoSelected: (uri: string, index: number) => void;
  isUploading?: boolean;
}

export const PhotoUploadSlot: React.FC<PhotoUploadSlotProps> = ({
  photo,
  index,
  onPhotoSelected,
  isUploading = false,
}) => {
  const [imageLoading, setImageLoading] = useState(true);

  // Reset loading state when photo changes
  React.useEffect(() => {
    if (photo) {
      setImageLoading(true);
    }
  }, [photo]);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [2, 3], // Match the display aspect ratio
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onPhotoSelected(result.assets[0].uri, index);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error picking image. Please try again.');
    }
  };

  return (
    <TouchableOpacity
      style={[styles.photoSlot, photo && styles.filledSlot]}
      onPress={pickImage}
      activeOpacity={0.7}
      disabled={isUploading}
    >
      {photo ? (
        <>
          <Image
            source={{ uri: photo }}
            style={styles.photo}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
          {(isUploading || imageLoading) && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              {isUploading && <Text style={styles.uploadingText}>Uploading...</Text>}
            </View>
          )}
        </>
      ) : (
        <>
          <Text style={styles.plus}>+</Text>
          {isUploading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  filledSlot: {
    borderColor: theme.colors.primary,
  },
  loadingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  photo: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  photoSlot: {
    alignItems: 'center',
    aspectRatio: 2 / 3,
    backgroundColor: '#fafafa',
    borderColor: '#ccc',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    marginBottom: 16,
    marginHorizontal: '1.5%',
    overflow: 'hidden',
    width: '30%',
  },
  plus: {
    color: theme.colors.primary,
    fontSize: 36,
    fontWeight: 'bold',
  },
  uploadingText: {
    color: theme.colors.primary,
    fontSize: 12,
    marginTop: 4,
  },
});
