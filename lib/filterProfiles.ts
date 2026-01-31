import { Profile } from '../types/profile';

// FilterCriteria is now extracted inline in filterProfiles function

interface UserWithPreferences {
  age?: number | Date | string;
  agePreference?: { min: number; max: number };
  distance_preference?: number;
  maxDistance?: number;
  preferences?: string;
  interested_in?: string[];
  gender?: string;
  location?: string;
}

/**
 * Calculate age from various formats
 */
function calculateAge(age: number | Date | string | undefined): number {
  if (!age) return 25; // Default age

  if (typeof age === 'number') {
    return age;
  }

  if (age instanceof Date) {
    return new Date().getFullYear() - age.getFullYear();
  }

  if (typeof age === 'string') {
    const birthDate = new Date(age);
    if (!isNaN(birthDate.getTime())) {
      return new Date().getFullYear() - birthDate.getFullYear();
    }
  }

  return 25; // Default if unable to calculate
}

/**
 * Calculate distance between two locations (mock implementation)
 * In a real app, this would use actual GPS coordinates
 */
function calculateDistance(location1: string, location2: string): number {
  // Mock implementation - returns random distance for demo
  // In production, use Haversine formula with actual coordinates
  const cities = ['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Seattle'];
  const idx1 = cities.indexOf(location1.split(',')[0]);
  const idx2 = cities.indexOf(location2.split(',')[0]);

  if (idx1 === idx2) return 0;

  // Mock distances between cities
  const distances = [
    [0, 2900, 380, 2100, 800], // SF
    [2900, 0, 2800, 800, 2400], // NY
    [380, 2800, 0, 2000, 1100], // LA
    [2100, 800, 2000, 0, 1700], // Chicago
    [800, 2400, 1100, 1700, 0], // Seattle
  ];

  if (idx1 >= 0 && idx2 >= 0) {
    return distances[idx1][idx2];
  }

  // Unknown cities - return 0 so they aren't filtered out by distance
  // Real distance filtering requires GPS coordinates (not yet implemented)
  return 0;
}

/**
 * Check if a profile matches gender preferences
 * Uses interested_in array (e.g., ["Men", "Women", "Everyone"])
 */
function matchesGenderPreference(profileGender: string, interestedIn: string[]): boolean {
  if (!interestedIn || interestedIn.length === 0) {
    return true; // No preference set, show all
  }

  // Normalize profile gender
  const normalizedGender = profileGender?.toLowerCase() || '';

  // Check if interested in everyone
  if (interestedIn.includes('Everyone') || interestedIn.includes('everyone')) {
    return true;
  }

  // Map profile gender to interested_in values
  // Profile gender: "Man", "Woman", "Non-binary", "male", "female"
  // Interested in: "Men", "Women", "Non-binary", "Everyone"

  if (normalizedGender === 'man' || normalizedGender === 'male') {
    return interestedIn.includes('Men') || interestedIn.includes('men');
  }

  if (normalizedGender === 'woman' || normalizedGender === 'female') {
    return interestedIn.includes('Women') || interestedIn.includes('women');
  }

  if (normalizedGender === 'non-binary' || normalizedGender === 'nonbinary') {
    return interestedIn.includes('Non-binary') || interestedIn.includes('non-binary');
  }

  return false;
}

/**
 * Check if current user matches the profile's preferences (mutual filtering)
 */
function profileIsInterestedInUser(profile: any, userGender: string | undefined): boolean {
  const profileInterestedIn = profile.interested_in;

  if (!profileInterestedIn || profileInterestedIn.length === 0) {
    return true; // Profile has no preference, assume interested in everyone
  }

  if (!userGender) {
    return true; // User gender unknown, don't filter
  }

  return matchesGenderPreference(userGender, profileInterestedIn);
}

/**
 * Filter profiles based on user preferences
 */
export function filterProfiles(
  profiles: Profile[],
  currentUser: UserWithPreferences | null
): Profile[] {
  if (!currentUser) {
    return profiles;
  }

  // Extract filter criteria from user preferences
  const ageRange = currentUser.agePreference || { min: 18, max: 99 };
  const maxDistance = currentUser.distance_preference || currentUser.maxDistance || 100;
  const interestedIn = currentUser.interested_in || [];
  const userGender = currentUser.gender;
  const userLocation = currentUser.location || '';

  console.log('[filterProfiles] Filtering with criteria:', {
    ageRange,
    maxDistance,
    interestedIn,
    userGender,
    totalProfiles: profiles.length,
  });

  // Debug: Log each profile's data before filtering
  profiles.forEach((profile) => {
    const profileName = (profile as any).nickname || profile.name || profile.id;
    console.log(`[filterProfiles] Profile ${profileName}:`, {
      gender: profile.gender,
      interested_in: (profile as any).interested_in,
      age: profile.age,
    });
  });

  const filtered = profiles.filter((profile) => {
    const profileName = (profile as any).nickname || profile.name || profile.id;

    // Age filter - be lenient if age is not set
    const profileAge = calculateAge(profile.age);
    if (profileAge < ageRange.min || profileAge > ageRange.max) {
      console.log(`[filterProfiles] Filtered out ${profileName}: age ${profileAge} not in range`);
      return false;
    }

    // Distance filter - skip if no location data
    if (userLocation && profile.location) {
      const distance = calculateDistance(userLocation, profile.location);
      if (distance > maxDistance) {
        console.log(
          `[filterProfiles] Filtered out ${profileName}: distance ${distance} > ${maxDistance}`
        );
        return false;
      }
    }

    // Gender preference filter - check if user is interested in this profile's gender
    const profileGender = profile.gender || '';
    if (interestedIn.length > 0 && !matchesGenderPreference(profileGender, interestedIn)) {
      console.log(
        `[filterProfiles] Filtered out ${profileName}: gender ${profileGender} not in ${interestedIn}`
      );
      return false;
    }

    // Mutual filtering - check if the profile is interested in the current user
    if (!profileIsInterestedInUser(profile, userGender)) {
      console.log(
        `[filterProfiles] Filtered out ${profileName}: not interested in user's gender ${userGender}`
      );
      return false;
    }

    return true;
  });

  console.log(`[filterProfiles] Filtered ${profiles.length} -> ${filtered.length} profiles`);
  return filtered;
}

/**
 * Sort profiles by relevance (distance, common interests, etc.)
 */
export function sortProfilesByRelevance(
  profiles: Profile[],
  currentUser: UserWithPreferences | null
): Profile[] {
  if (!currentUser) {
    return profiles;
  }

  const userLocation = currentUser.location || 'San Francisco, CA';
  const userHobbies = (currentUser as any).hobbies || [];

  return [...profiles].sort((a, b) => {
    // Sort by distance first
    const distanceA = calculateDistance(userLocation, a.location);
    const distanceB = calculateDistance(userLocation, b.location);

    if (distanceA !== distanceB) {
      return distanceA - distanceB;
    }

    // Then by common interests
    const commonHobbiesA = a.hobbies.filter((h) => userHobbies.includes(h)).length;
    const commonHobbiesB = b.hobbies.filter((h) => userHobbies.includes(h)).length;

    return commonHobbiesB - commonHobbiesA;
  });
}
