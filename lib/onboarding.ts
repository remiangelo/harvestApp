import { supabase } from './supabase';
import { uploadPhoto } from './profiles';

// Save onboarding data after each step
export const saveOnboardingStep = async (
  userId: string,
  stepData: Record<string, any>
) => {
  try {
    // Handle special cases for data transformation
    const processedData: Record<string, any> = {};

    // Convert age Date to actual age number
    if (stepData.age && stepData.age instanceof Date) {
      const birthYear = stepData.age.getFullYear();
      const currentYear = new Date().getFullYear();
      processedData.age = currentYear - birthYear;
    }

    // Handle distance preference
    if (stepData.distance !== undefined) {
      processedData.distance_preference = stepData.distance;
    }

    // Handle photos array - upload to storage
    if (stepData.photos && Array.isArray(stepData.photos)) {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < stepData.photos.length; i++) {
        const photoUri = stepData.photos[i];
        if (photoUri && !photoUri.startsWith('http')) {
          // This is a local URI, needs to be uploaded
          const { url, error } = await uploadPhoto(userId, photoUri, i);
          if (url) {
            uploadedUrls.push(url);
          } else {
            console.error(`Failed to upload photo ${i}:`, error);
          }
        } else if (photoUri) {
          // This is already a URL, keep it
          uploadedUrls.push(photoUri);
        }
      }
      
      processedData.photos = uploadedUrls;
    }

    // Copy over other fields directly
    const directFields = ['preferences', 'bio', 'nickname', 'hobbies', 'goals', 'gender', 'location'];
    directFields.forEach(field => {
      if (stepData[field] !== undefined) {
        processedData[field] = stepData[field];
      }
    });

    // Update the user profile
    const { data, error } = await supabase
      .from('users')
      .update({
        ...processedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error saving onboarding step:', error);
    return { data: null, error };
  }
};

// Mark onboarding as complete
export const completeOnboarding = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return { data: null, error };
  }
};

// Get current onboarding progress
export const getOnboardingProgress = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        age,
        preferences,
        bio,
        nickname,
        photos,
        hobbies,
        distance_preference,
        goals,
        gender,
        location,
        onboarding_completed
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Calculate which step the user is on based on completed fields
    let currentStep = 'age'; // Default to first step
    
    if (data) {
      if (data.location && data.gender && data.goals && data.distance_preference && 
          data.hobbies && data.photos && data.nickname && data.bio && 
          data.preferences && data.age) {
        currentStep = 'complete';
      } else if (data.gender && data.goals && data.distance_preference && 
                 data.hobbies && data.photos && data.nickname && data.bio && 
                 data.preferences && data.age) {
        currentStep = 'location';
      } else if (data.goals && data.distance_preference && data.hobbies && 
                 data.photos && data.nickname && data.bio && data.preferences && data.age) {
        currentStep = 'gender';
      } else if (data.distance_preference && data.hobbies && data.photos && 
                 data.nickname && data.bio && data.preferences && data.age) {
        currentStep = 'goals';
      } else if (data.hobbies && data.photos && data.nickname && data.bio && 
                 data.preferences && data.age) {
        currentStep = 'distance';
      } else if (data.photos && data.nickname && data.bio && data.preferences && data.age) {
        currentStep = 'hobbies';
      } else if (data.nickname && data.bio && data.preferences && data.age) {
        currentStep = 'photos';
      } else if (data.bio && data.preferences && data.age) {
        currentStep = 'nickname';
      } else if (data.preferences && data.age) {
        currentStep = 'bio';
      } else if (data.age) {
        currentStep = 'preferences';
      }
    }
    
    return { 
      data, 
      currentStep,
      isComplete: data?.onboarding_completed || false,
      error: null 
    };
  } catch (error) {
    console.error('Error getting onboarding progress:', error);
    return { data: null, currentStep: 'age', isComplete: false, error };
  }
};