import { supabase } from './supabase';
import { uploadPhoto } from './profiles';
import { ensureProfileExists } from './profileHelpers';

// Save onboarding data after each step
export const saveOnboardingStep = async (
  userId: string,
  stepData: Record<string, any>,
  userEmail?: string
) => {
  try {
    console.log('[saveOnboardingStep] Starting save for user:', userId);
    console.log('[saveOnboardingStep] Step data:', Object.keys(stepData));

    // CRITICAL: Ensure profile exists before saving
    // This will create the profile if it doesn't exist
    let email: string;
    try {
      const result = await ensureProfileExists(userId);
      email = result.email;
      console.log('[saveOnboardingStep] Profile confirmed. Email:', email);
    } catch (profileError) {
      console.error('[saveOnboardingStep] Profile creation failed:', profileError);
      return {
        data: null,
        error: {
          message:
            'Failed to create your profile. Please check your internet connection and try again.',
          code: 'PROFILE_CREATION_FAILED',
          details: profileError,
        },
      };
    }

    // Handle special cases for data transformation
    const processedData: Record<string, any> = {};

    // Convert age Date to actual age number with validation
    if (stepData.age && stepData.age instanceof Date) {
      const birthYear = stepData.age.getFullYear();
      const currentYear = new Date().getFullYear();
      const calculatedAge = currentYear - birthYear;

      // Validate age is within acceptable range (18-100)
      if (calculatedAge < 18 || calculatedAge > 100) {
        return {
          data: null,
          error: {
            message: 'Age must be between 18 and 100 years old.',
            code: 'INVALID_AGE',
            details: { calculatedAge },
          },
        };
      }

      processedData.age = calculatedAge;
    }

    // Handle distance preference
    if (stepData.distance !== undefined) {
      processedData.distance_preference = stepData.distance;
    }

    // Handle photos array - upload to storage in parallel with timeout protection
    if (stepData.photos && Array.isArray(stepData.photos)) {
      // Timeout wrapper to prevent infinite hangs
      const uploadWithTimeout = (promise: Promise<any>, timeout: number) => {
        return Promise.race([
          promise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Upload timeout')), timeout)
          ),
        ]);
      };

      const uploadPromises = stepData.photos.map(async (photoUri, i) => {
        try {
          if (photoUri && !photoUri.startsWith('http')) {
            // This is a local URI, needs to be uploaded with 30s timeout
            const uploadPromise = uploadPhoto(userId, photoUri, i);
            const { url, error } = (await uploadWithTimeout(uploadPromise, 30000)) as any;
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
        } catch (timeoutError) {
          console.error(`Photo ${i} upload timeout after 30s:`, timeoutError);
          // Return local URI as fallback on timeout
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
      console.error('[saveOnboardingStep] Error details:', JSON.stringify(error, null, 2));

      // Provide specific error messages based on error code
      let userMessage = 'Failed to save your information. Please try again.';
      if (error.code === '23505') {
        userMessage = 'This profile already exists. Please continue to the next step.';
      } else if (error.code === 'PGRST301') {
        userMessage = 'Permission denied. Please sign out and sign in again.';
      } else if (error.message?.includes('violates row-level security')) {
        userMessage = 'You do not have permission to update this profile. Please contact support.';
      }

      return {
        data: null,
        error: {
          message: userMessage,
          code: error.code || 'DATABASE_ERROR',
          details: error,
        },
      };
    }

    console.log('[saveOnboardingStep] Save successful');
    return { data, error: null };
  } catch (error) {
    console.error('[saveOnboardingStep] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      data: null,
      error: {
        message: `An unexpected error occurred: ${errorMessage}`,
        code: 'UNEXPECTED_ERROR',
        details: error,
      },
    };
  }
};

// Mark onboarding as complete
export const completeOnboarding = async (userId: string) => {
  try {
    console.log('[completeOnboarding] Completing onboarding for user:', userId);

    // CRITICAL: Ensure profile exists before completing
    let email: string;
    try {
      const result = await ensureProfileExists(userId);
      email = result.email;
      console.log('[completeOnboarding] Profile confirmed. Email:', email);
    } catch (profileError) {
      console.error('[completeOnboarding] Profile creation failed:', profileError);
      return {
        data: null,
        error: {
          message:
            'Failed to complete onboarding. Please check your internet connection and try again.',
          code: 'PROFILE_CREATION_FAILED',
          details: profileError,
        },
      };
    }

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
      console.error('[completeOnboarding] Error details:', JSON.stringify(error, null, 2));

      // Provide specific error messages based on error code
      let userMessage = 'Failed to complete onboarding. Please try again.';
      if (error.code === 'PGRST301') {
        userMessage = 'Permission denied. Please sign out and sign in again.';
      } else if (error.message?.includes('violates row-level security')) {
        userMessage = 'You do not have permission to update this profile. Please contact support.';
      }

      return {
        data: null,
        error: {
          message: userMessage,
          code: error.code || 'DATABASE_ERROR',
          details: error,
        },
      };
    }

    console.log('[completeOnboarding] Onboarding completed successfully');
    return { data, error: null };
  } catch (error) {
    console.error('[completeOnboarding] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      data: null,
      error: {
        message: `An unexpected error occurred: ${errorMessage}`,
        code: 'UNEXPECTED_ERROR',
        details: error,
      },
    };
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
