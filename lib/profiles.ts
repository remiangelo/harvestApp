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
    // Convert URI to blob
    const response = await fetch(photoUri);
    const blob = await response.blob();

    // Create file name
    const fileName = `${userId}/photo_${photoIndex}_${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage.from('profile-photos').upload(fileName, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-photos').getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading photo:', error);
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
