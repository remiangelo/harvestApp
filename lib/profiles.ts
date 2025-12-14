import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';

export interface UserProfile {
  id: string;
  email: string;
  nickname?: string;
  age?: number;
  bio?: string;
  location?: string;
  gender?: string;
  preferences?: string;
  goals?: string;
  hobbies?: string[];
  photos?: string[];
  distance_preference?: number;
  created_at?: string;
  updated_at?: string;
  onboarding_completed?: boolean;
}

// Create a new user profile (or update if exists)
export const createProfile = async (userId: string, email: string) => {
  try {
    console.log('[createProfile] Creating/updating profile for user:', userId, 'email:', email);
    // Use UPSERT instead of INSERT to handle existing users (from OAuth)
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: userId,
          email,
          nickname: email.split('@')[0], // Use email prefix as default nickname
          bio: "I'm new here!", // Default bio for streamlined onboarding
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id', // If ID exists, update instead of failing
        }
      )
      .select()
      .maybeSingle(); // Use maybeSingle() to avoid 406 errors

    if (error) {
      console.error('[createProfile] Upsert error:', error);
      throw error;
    }

    console.log('[createProfile] Profile created/updated successfully');
    return { data, error: null };
  } catch (error) {
    console.error('[createProfile] Error creating profile:', error);
    return { data: null, error };
  }
};

// Get user profile
export const getProfile = async (userId: string) => {
  try {
    // Use maybeSingle() instead of single() to avoid 406 errors
    // maybeSingle() returns null if no rows match, instead of throwing
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();

    if (error) {
      console.error('[getProfile] Database error:', error);
      throw error;
    }

    if (!data) {
      console.log('[getProfile] Profile not found for user:', userId);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error };
  }
};

// Update user profile
export const updateProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    // Map the updates to match database schema
    const dbUpdates: any = {
      updated_at: new Date().toISOString(),
    };

    // Map fields to database columns (matching migration 003)
    if (updates.nickname) dbUpdates.nickname = updates.nickname;
    if (updates.age !== undefined) dbUpdates.age = updates.age;
    if (updates.bio) dbUpdates.bio = updates.bio;
    if (updates.location) dbUpdates.location = updates.location;
    if (updates.gender) dbUpdates.gender = updates.gender;
    if (updates.photos) dbUpdates.photos = updates.photos;
    if (updates.hobbies) dbUpdates.hobbies = updates.hobbies;
    if (updates.distance_preference !== undefined)
      dbUpdates.distance_preference = updates.distance_preference;
    if (updates.preferences) dbUpdates.preferences = updates.preferences;
    if (updates.goals) dbUpdates.goals = updates.goals;

    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', userId)
      .select()
      .maybeSingle(); // Use maybeSingle() to avoid 406 errors

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
};

// Check if user has completed onboarding
export const checkOnboardingStatus = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('bio, age, gender, photos')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle() to avoid 406 errors

    if (error) throw error;

    // Consider onboarding complete if basic profile fields are filled
    const completed = !!(data?.bio && data?.age && data?.gender && data?.photos?.length > 0);

    return { completed, error: null };
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return { completed: false, error };
  }
};

// Upload profile photo
export const uploadPhoto = async (userId: string, photoUri: string, photoIndex: number) => {
  try {
    console.log('[uploadPhoto] Starting upload for user:', userId, 'index:', photoIndex);
    console.log('[uploadPhoto] Photo URI:', photoUri.substring(0, 100) + '...');

    // Create file name
    const fileName = `${userId}/photo_${photoIndex}_${Date.now()}.jpg`;

    // For React Native, we need to read the file as base64 and convert to ArrayBuffer
    // The fetch API doesn't work properly with local file:// URIs in React Native
    let fileData: ArrayBuffer | Blob;

    // Check if it's a local file URI (file://, content://, ph://, etc.)
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

      console.log('[uploadPhoto] Read file as base64, length:', base64Data.length);

      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileData = bytes.buffer;

      console.log('[uploadPhoto] Converted to ArrayBuffer, size:', bytes.length);
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

    if (error) {
      console.error('[uploadPhoto] Supabase upload error:', error);
      throw error;
    }

    console.log('[uploadPhoto] Upload successful, path:', data?.path);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-photos').getPublicUrl(fileName);

    console.log('[uploadPhoto] Public URL:', publicUrl);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('[uploadPhoto] Error uploading photo:', error);
    return { url: null, error };
  }
};

// Delete profile photo
export const deletePhoto = async (photoUrl: string) => {
  try {
    // Extract file path from URL more safely
    const url = new URL(photoUrl);
    const pathParts = url.pathname.split('/storage/v1/object/public/profile-photos/');

    if (pathParts.length !== 2) {
      throw new Error('Invalid photo URL format');
    }

    const fileName = pathParts[1];

    const { error } = await supabase.storage.from('profile-photos').remove([fileName]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting photo:', error);
    return { error };
  }
};
