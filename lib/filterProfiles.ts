import { DemoProfile } from '../data/demoProfiles';

interface FilterCriteria {
  ageRange: { min: number; max: number };
  maxDistance: number;
  interestedIn: string;
}

interface UserWithPreferences {
  age?: number | Date | string;
  agePreference?: { min: number; max: number };
  distance_preference?: number;
  maxDistance?: number;
  preferences?: string;
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
    [0, 2900, 380, 2100, 800],    // SF
    [2900, 0, 2800, 800, 2400],   // NY
    [380, 2800, 0, 2000, 1100],   // LA
    [2100, 800, 2000, 0, 1700],   // Chicago
    [800, 2400, 1100, 1700, 0],   // Seattle
  ];
  
  if (idx1 >= 0 && idx2 >= 0) {
    return distances[idx1][idx2];
  }
  
  // Random distance for unknown cities
  return Math.floor(Math.random() * 100) + 1;
}

/**
 * Check if a profile matches gender preferences
 */
function matchesGenderPreference(profileGender: string, preference: string): boolean {
  if (preference === 'all' || preference === 'everyone') {
    return true;
  }
  
  if (preference === profileGender) {
    return true;
  }
  
  // Handle bisexual/pansexual preferences
  if (preference === 'bisexual' || preference === 'pansexual') {
    return profileGender === 'male' || profileGender === 'female';
  }
  
  return false;
}

/**
 * Filter profiles based on user preferences
 */
export function filterProfiles(
  profiles: DemoProfile[],
  currentUser: UserWithPreferences | null
): DemoProfile[] {
  if (!currentUser) {
    return profiles;
  }
  
  // Extract filter criteria from user preferences
  const criteria: FilterCriteria = {
    ageRange: currentUser.agePreference || { min: 18, max: 50 },
    maxDistance: currentUser.distance_preference || currentUser.maxDistance || 50,
    interestedIn: currentUser.preferences || 'all',
  };
  
  const userLocation = currentUser.location || 'San Francisco, CA';
  
  return profiles.filter(profile => {
    // Age filter
    const profileAge = calculateAge(profile.age);
    if (profileAge < criteria.ageRange.min || profileAge > criteria.ageRange.max) {
      return false;
    }
    
    // Distance filter
    const distance = calculateDistance(userLocation, profile.location);
    if (distance > criteria.maxDistance) {
      return false;
    }
    
    // Gender preference filter
    const profileGender = profile.gender || 'unknown';
    if (!matchesGenderPreference(profileGender, criteria.interestedIn)) {
      return false;
    }
    
    // In a real app, you would also check if the current user matches
    // the profile's preferences (mutual filtering)
    
    return true;
  });
}

/**
 * Sort profiles by relevance (distance, common interests, etc.)
 */
export function sortProfilesByRelevance(
  profiles: DemoProfile[],
  currentUser: UserWithPreferences | null
): DemoProfile[] {
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
    const commonHobbiesA = a.hobbies.filter(h => userHobbies.includes(h)).length;
    const commonHobbiesB = b.hobbies.filter(h => userHobbies.includes(h)).length;
    
    return commonHobbiesB - commonHobbiesA;
  });
}