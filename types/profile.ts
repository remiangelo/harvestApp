/**
 * Profile type definitions for the Harvest app.
 * These types define the structure of user profiles.
 */

export interface Profile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  hobbies: string[];
  location: string;
  gender: string;
  sexualIdentity: string;
  relationshipGoals: string[];
}

export interface User {
  email: string;
  password?: string;
  name: string;
  role?: 'user' | 'admin';
  onboardingCompleted?: boolean;
  age?: Date;
  bio?: string;
  nickname?: string;
  photos?: string[];
  hobbies?: string[];
  distance?: number;
  gender?: string;
  preferences?: string;
  goals?: string;
  location?: string;
}

/** @deprecated Use User instead */
export type DemoUser = User;
