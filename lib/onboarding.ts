import { supabase } from './supabase';
import { uploadPhoto } from './profiles';

// Save onboarding data after each step
export const saveOnboardingStep = async (
  userId: string,
  stepData: Record<string, any>,
  userEmail?: string
) => {
  try {
    console.log('[saveOnboardingStep] Starting save for user:', userId);
    console.log('[saveOnboardingStep] Step data:', Object.keys(stepData));

    // CRITICAL: Get user email from auth if not provided
    let email = userEmail;
    if (!email) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      email = user?.email;
      console.log('[saveOnboardingStep] Retrieved email from auth:', email);
    }

    if (!email) {
      console.error('[saveOnboardingStep] No email available - this will cause save to fail!');
      throw new Error('User email is required but not available');
    }

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

    // Handle photos array - upload to storage in parallel
    if (stepData.photos && Array.isArray(stepData.photos)) {
      const uploadPromises = stepData.photos.map(async (photoUri, i) => {
        if (photoUri && !photoUri.startsWith('http')) {
          // This is a local URI, needs to be uploaded
          const { url, error } = await uploadPhoto(userId, photoUri, i);
          if (url) {
            return url;
          } else {
            console.error(`Failed to upload photo ${i}:`, error);
            // Return the local URI as fallback
            return photoUri;
          }
        } else if (photoUri) {
          // This is already a URL, keep it
          return photoUri;
        }
        return null;
      });

      const uploadResults = await Promise.all(uploadPromises);
      processedData.photos = uploadResults.filter((url) => url !== null);
    }

    // Copy over other fields directly
    const directFields = [
      'preferences',
      'bio',
      'nickname',
      'hobbies',
      'goals',
      'gender',
      'location',
    ];
    directFields.forEach((field) => {
      if (stepData[field] !== undefined) {
        processedData[field] = stepData[field];
      }
    });

    // UPSERT the user profile (update if exists, insert if not)
    // CRITICAL: Must include email for INSERT to work (email is NOT NULL)
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: userId,
          email, // CRITICAL: Include email for NOT NULL constraint
          ...processedData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[saveOnboardingStep] Database error:', error);
      throw error;
    }

    console.log('[saveOnboardingStep] Save successful');
    return { data, error: null };
  } catch (error) {
    console.error('[saveOnboardingStep] Error:', error);
    return { data: null, error };
  }
};

// Mark onboarding as complete
export const completeOnboarding = async (userId: string) => {
  try {
    console.log('[completeOnboarding] Completing onboarding for user:', userId);

    // CRITICAL: Get user email from auth for UPSERT
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const email = user?.email;

    if (!email) {
      console.error('[completeOnboarding] No email available - cannot complete onboarding!');
      throw new Error('User email is required to complete onboarding');
    }

    console.log('[completeOnboarding] Using email:', email);

    // UPSERT to ensure profile exists
    // CRITICAL: Must include email for INSERT to work (email is NOT NULL)
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id: userId,
          email, // CRITICAL: Include email for NOT NULL constraint
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[completeOnboarding] Database error:', error);
      throw error;
    }

    console.log('[completeOnboarding] Onboarding completed successfully');
    return { data, error: null };
  } catch (error) {
    console.error('[completeOnboarding] Error:', error);
    return { data: null, error };
  }
};

// Get current onboarding progress
export const getOnboardingProgress = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
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
      `
      )
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Calculate which step the user is on based on completed fields
    let currentStep = 'age'; // Default to first step

    if (data) {
      // Check fields in reverse order to find the last completed step
      if (data.onboarding_completed) {
        currentStep = 'complete';
      } else if (data.location) {
        currentStep = 'complete'; // Location is the last step before complete
      } else if (data.gender) {
        currentStep = 'location';
      } else if (data.goals) {
        currentStep = 'gender';
      } else if (data.distance_preference !== null && data.distance_preference !== undefined) {
        currentStep = 'goals';
      } else if (data.hobbies && data.hobbies.length > 0) {
        currentStep = 'distance';
      } else if (data.photos && data.photos.length > 0) {
        currentStep = 'hobbies';
      } else if (data.nickname) {
        currentStep = 'photos';
      } else if (data.bio) {
        currentStep = 'nickname';
      } else if (data.preferences) {
        currentStep = 'bio';
      } else if (data.age !== null && data.age !== undefined) {
        currentStep = 'preferences';
      }
    }

    return {
      data,
      currentStep,
      isComplete: data?.onboarding_completed || false,
      error: null,
    };
  } catch (error) {
    console.error('Error getting onboarding progress:', error);
    return { data: null, currentStep: 'age', isComplete: false, error };
  }
};
