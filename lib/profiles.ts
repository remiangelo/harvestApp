import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

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

// Create a new user profile
export const createProfile = async (userId: string, email: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: userId,
          email,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating profile:', error);
    return { data: null, error };
  }
};

// Get user profile
export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error };
  }
};

// Update user profile
export const updateProfile = async (userId: string, updates: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

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
      .select('onboarding_completed')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { completed: data?.onboarding_completed || false, error: null };
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return { completed: false, error };
  }
};

// Upload profile photo
export const uploadPhoto = async (userId: string, photoUri: string, photoIndex: number) => {
  try {
    // Convert URI to blob
    const response = await fetch(photoUri);
    const blob = await response.blob();
    
    // Create file name
    const fileName = `${userId}/photo_${photoIndex}_${Date.now()}.jpg`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading photo:', error);
    return { url: null, error };
  }
};

// Delete profile photo
export const deletePhoto = async (photoUrl: string) => {
  try {
    // Extract file path from URL
    const urlParts = photoUrl.split('/');
    const fileName = urlParts.slice(-2).join('/');
    
    const { error } = await supabase.storage
      .from('profile-photos')
      .remove([fileName]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting photo:', error);
    return { error };
  }
};