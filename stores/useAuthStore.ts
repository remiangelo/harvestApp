import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import {
  supabase,
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  signInWithOAuth,
} from '../lib/supabase';
import { createProfile, getProfile, UserProfile } from '../lib/profiles';
import useUserStore from './useUserStore';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isTestMode: boolean;

  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: any }>;
  loginWithOAuth: (provider: 'google' | 'facebook') => Promise<{ error: any }>;
  register: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  logout: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  loadProfile: (userId: string) => Promise<void>;
  setTestMode: (enabled: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      isTestMode: false,

      initialize: async () => {
        try {
          set({ isLoading: true });

          // Check for test mode first
          const testMode = await AsyncStorage.getItem('harvest-test-mode');
          const testUserData = await AsyncStorage.getItem('harvest-test-user');

          if (testMode === 'true' && testUserData) {
            // Load test user
            const testUser = JSON.parse(testUserData);
            useUserStore.getState().setCurrentUser(testUser);
            set({
              isAuthenticated: true,
              isTestMode: true,
              isLoading: false,
            });
            return;
          }

          // Normal Supabase authentication
          const { user, error } = await getCurrentUser();

          if (user && !error) {
            const {
              data: { session },
            } = await supabase.auth.getSession();

            // Load user profile
            const { data: profile } = await getProfile(user.id);

            set({
              user,
              session,
              profile,
              isAuthenticated: true,
              isLoading: false,
            });

            // Sync with user store
            if (profile) {
              useUserStore.getState().setCurrentUser(profile);
            }
          } else {
            set({
              user: null,
              session: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const { data, error } = await signIn(email, password);

          if (error) {
            console.error('Login error:', error);
            console.log('Supabase client status:', supabase ? 'initialized' : 'not initialized');
            set({ isLoading: false });
            return { error };
          }

          if (data.user && data.session) {
            // Load user profile
            const { data: profile } = await getProfile(data.user.id);

            set({
              user: data.user,
              session: data.session,
              profile,
              isAuthenticated: true,
              isLoading: false,
            });

            // Sync with user store
            if (profile) {
              useUserStore.getState().setCurrentUser(profile);
            }
          }

          return { error: null };
        } catch (error) {
          set({ isLoading: false });
          return { error };
        }
      },

      loginWithOAuth: async (provider: 'google' | 'facebook') => {
        try {
          set({ isLoading: true });
          const { data, error } = await signInWithOAuth(provider);

          if (error) {
            console.error('OAuth error:', error);
            set({ isLoading: false });
            return { error };
          }

          // Open the OAuth URL in browser
          if (data?.url) {
            await Linking.openURL(data.url);
            // Don't set isLoading to false yet - wait for the redirect callback
            // The session will be picked up by the auth state listener
          } else {
            console.error('No OAuth URL returned from Supabase');
            set({ isLoading: false });
            return { error: new Error('No OAuth URL returned') };
          }

          return { error: null };
        } catch (error) {
          console.error('OAuth exception:', error);
          set({ isLoading: false });
          return { error };
        }
      },

      register: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const { data, error } = await signUp(email, password);

          if (error) {
            console.error('Signup error:', error);
            console.log('Supabase client status:', supabase ? 'initialized' : 'not initialized');
            set({ isLoading: false });
            return { error, data };
          }

          // Create user profile - CRITICAL for onboarding to work
          if (data.user) {
            console.log('[Register] Creating profile for new user:', data.user.id);
            try {
              const { ensureProfileExists } = await import('../lib/profileHelpers');
              await ensureProfileExists(data.user.id);
              console.log('[Register] Profile created/verified successfully');
            } catch (profileError) {
              console.error('[Register] Failed to create profile:', profileError);
              // Don't fail the signup - let the user continue to onboarding
              // ensureProfileExists will be called again in onboarding
            }
          }

          // Note: Supabase may require email confirmation
          // In that case, user won't be logged in immediately
          if (data.user && data.session) {
            const { data: profile } = await getProfile(data.user.id);

            set({
              user: data.user,
              session: data.session,
              profile,
              isAuthenticated: true,
              isLoading: false,
            });

            // Sync with user store
            if (profile) {
              useUserStore.getState().setCurrentUser(profile);
            }
          } else {
            set({ isLoading: false });
          }

          return { error: null, data };
        } catch (error) {
          set({ isLoading: false });
          return { error, data: null };
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          // Clear test mode if enabled
          const testMode = get().isTestMode;
          if (testMode) {
            await AsyncStorage.removeItem('harvest-test-mode');
            await AsyncStorage.removeItem('harvest-test-user');
          } else {
            await signOut();
          }

          set({
            user: null,
            session: null,
            profile: null,
            isAuthenticated: false,
            isTestMode: false,
            isLoading: false,
          });

          // Clear user store
          useUserStore.getState().logout();
        } catch (error) {
          console.error('Logout error:', error);
          set({ isLoading: false });
        }
      },

      setSession: (session: Session | null) => {
        set({ session, isAuthenticated: !!session, isLoading: false });
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      loadProfile: async (userId: string) => {
        try {
          console.log('[loadProfile] Loading profile for user:', userId);
          const { data: profile, error } = await getProfile(userId);

          if (error) {
            console.error('[loadProfile] Error from getProfile:', error);
            throw error; // Throw so caller can handle
          }

          if (profile) {
            console.log('[loadProfile] Profile loaded successfully');
            set({ profile });
            useUserStore.getState().setCurrentUser(profile);
          } else {
            console.warn('[loadProfile] No profile data returned');
            // Profile doesn't exist - this is okay, don't crash
          }
        } catch (error) {
          console.error('[loadProfile] Failed to load profile:', error);
          throw error; // Re-throw so finishOnboarding can handle it
        }
      },

      setTestMode: (enabled: boolean) => {
        set({ isTestMode: enabled });
      },

      setAuthenticated: (authenticated: boolean) => {
        set({ isAuthenticated: authenticated });
      },
    }),
    {
      name: 'harvest-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        session: state.session,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        isTestMode: state.isTestMode,
      }),
    }
  )
);
