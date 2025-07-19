import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, getCurrentUser } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,

      initialize: async () => {
        try {
          set({ isLoading: true });
          
          // Get current user from Supabase
          const { user, error } = await getCurrentUser();
          
          if (user && !error) {
            const { data: { session } } = await supabase.auth.getSession();
            set({ 
              user, 
              session,
              isAuthenticated: true,
              isLoading: false 
            });
          } else {
            set({ 
              user: null, 
              session: null,
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
            set({ 
              user: data.user, 
              session: data.session,
              isAuthenticated: true,
              isLoading: false 
            });
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

          // Note: Supabase may require email confirmation
          // In that case, user won't be logged in immediately
          if (data.user && data.session) {
            set({ 
              user: data.user, 
              session: data.session,
              isAuthenticated: true,
              isLoading: false 
            });
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
          await signOut();
          set({ 
            user: null, 
            session: null,
            isAuthenticated: false,
            isLoading: false 
          });
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
    }),
    {
      name: 'harvest-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        // Only persist these fields
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);