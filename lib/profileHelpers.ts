import { supabase } from './supabase';
import { createProfile, getProfile } from './profiles';

/**
 * Ensures a user profile exists in the database before any operation
 * This is CRITICAL for onboarding saves to work
 *
 * @param userId - The user's ID from auth
 * @returns Profile data or throws an error
 */
export const ensureProfileExists = async (
  userId: string
): Promise<{
  exists: boolean;
  profile: any;
  email: string;
}> => {
  console.log('[ensureProfileExists] Checking profile for user:', userId);

  // Step 1: Get the authenticated user to retrieve email
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error('[ensureProfileExists] No authenticated user:', authError);
    throw new Error('User must be authenticated to ensure profile exists');
  }

  if (user.id !== userId) {
    console.error('[ensureProfileExists] User ID mismatch! Auth:', user.id, 'Requested:', userId);
    throw new Error('User ID does not match authenticated user');
  }

  const email = user.email;
  if (!email) {
    console.error('[ensureProfileExists] User has no email address');
    throw new Error('User email is required but not available');
  }

  console.log('[ensureProfileExists] Auth user confirmed. Email:', email);

  // Step 2: Check if profile exists
  const { data: existingProfile, error: getError } = await getProfile(userId);

  if (getError) {
    console.error('[ensureProfileExists] Error checking profile:', getError);
    // Profile doesn't exist or other error
  }

  if (existingProfile) {
    console.log('[ensureProfileExists] Profile exists');
    return {
      exists: true,
      profile: existingProfile,
      email,
    };
  }

  // Step 3: Profile doesn't exist - create it now
  console.log('[ensureProfileExists] Profile does not exist. Creating...');

  const { data: newProfile, error: createError } = await createProfile(userId, email);

  if (createError) {
    console.error('[ensureProfileExists] Failed to create profile:', createError);

    // Retry once with a small delay
    console.log('[ensureProfileExists] Retrying profile creation...');
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { data: retryProfile, error: retryError } = await createProfile(userId, email);

    if (retryError) {
      console.error('[ensureProfileExists] Retry also failed:', retryError);
      const errorMessage = retryError instanceof Error ? retryError.message : 'Unknown error';
      throw new Error(`Failed to create profile: ${errorMessage}`);
    }

    console.log('[ensureProfileExists] Profile created successfully on retry');
    return {
      exists: false,
      profile: retryProfile,
      email,
    };
  }

  console.log('[ensureProfileExists] Profile created successfully');
  return {
    exists: false,
    profile: newProfile,
    email,
  };
};

/**
 * Validates that the user session is active and can make database operations
 */
export const validateUserSession = async (): Promise<{
  valid: boolean;
  userId: string;
  email: string;
}> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('[validateUserSession] No valid session:', error);
    return {
      valid: false,
      userId: '',
      email: '',
    };
  }

  if (!user.email) {
    console.error('[validateUserSession] User has no email');
    return {
      valid: false,
      userId: user.id,
      email: '',
    };
  }

  return {
    valid: true,
    userId: user.id,
    email: user.email,
  };
};
