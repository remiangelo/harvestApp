import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system/legacy';

export const uploadProfilePhoto = async (userId: string, photoUri: string, photoIndex: number) => {
  try {
    // Generate unique filename
    const fileName = `${userId}/${Date.now()}_${photoIndex}.jpg`;

    // For React Native, we need to read the file as base64 and convert to ArrayBuffer
    // The fetch API doesn't work properly with local file:// URIs in React Native
    let fileData: ArrayBuffer | Blob;

    // Check if it's a local file URI
    const isLocalFile =
      photoUri.startsWith('file://') ||
      photoUri.startsWith('content://') ||
      photoUri.startsWith('ph://') ||
      photoUri.startsWith('assets-library://') ||
      !photoUri.startsWith('http');

    if (isLocalFile) {
      // Use expo-file-system to read the file as base64

      // Read file as base64
      const base64Data = await FileSystem.readAsStringAsync(photoUri, {
        encoding: 'base64',
      });

      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileData = bytes.buffer;
    } else {
      // For remote URLs, use fetch
      const response = await fetch(photoUri);
      fileData = await response.blob();
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, fileData, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-photos').getPublicUrl(fileName);

    return { url: publicUrl, path: data.path };
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

export const deleteProfilePhoto = async (photoPath: string) => {
  try {
    const { error } = await supabase.storage.from('profile-photos').remove([photoPath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

export const getProfilePhotos = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }
};

// Fuck Me.
