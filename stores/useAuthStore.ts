import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '../lib/supabase';
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
  register: (email: string, password: string) => Promise<{ error: any }>;
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
              isLoading: false 
            });
            return;
          }
          
          // Normal Supabase authentication
          const { user, error } = await getCurrentUser();
          
          if (user && !error) {
            const { data: { session } } = await supabase.auth.getSession();
            
            // Load user profile
            const { data: profile } = await getProfile(user.id);
            
            set({ 
              user, 
              session,
              profile,
              isAuthenticated: true,
              isLoading: false 
            });
            
            // Sync with user store
            if (profile) {
              useUserStore.getState().setCurrentUser(profile as any);
            }
          } else {
            set({ 
              user: null, 
              session: null,
              profile: null,
              isAuthenticated: false,
              isLoading: false 
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
              isLoading: false 
            });
            
            // Sync with user store
            if (profile) {
              useUserStore.getState().setCurrentUser(profile as any);
            }
          }
          
          return { error: null };
        } catch (error) {
          set({ isLoading: false });
          return { error };
        }
      },

      register: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const { data, error } = await signUp(email, password);
          
          if (error) {
            set({ isLoading: false });
            return { error };
          }

          // Create user profile
          if (data.user) {
            await createProfile(data.user.id, email);
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
              isLoading: false 
            });
            
            // Sync with user store
            if (profile) {
              useUserStore.getState().setCurrentUser(profile as any);
            }
          } else {
            set({ isLoading: false });
          }
          
          return { error: null };
        } catch (error) {
          set({ isLoading: false });
          return { error };
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
            isLoading: false 
          });
          
          // Clear user store
          useUserStore.getState().logout();
        } catch (error) {
          console.error('Logout error:', error);
          set({ isLoading: false });
        }
      },

      setSession: (session: Session | null) => {
        set({ session, isAuthenticated: !!session });
      },

      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
      
      loadProfile: async (userId: string) => {
        try {
          const { data: profile } = await getProfile(userId);
          if (profile) {
            set({ profile });
            useUserStore.getState().setCurrentUser(profile as any);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
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