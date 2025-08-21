import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Try to get from Expo Constants first (for production builds), then fall back to env vars
const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://jutzlxdboayvmcuqwodn.supabase.co';

const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1dHpseGRib2F5dm1jdXF3b2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5MTg4MTksImV4cCI6MjA2ODQ5NDgxOX0.SpsUKEH_pxCWVqoVYTsVOz9ULS9oAoz40CqMK-WJG4g';

// Debug logging for production
console.log('Supabase configuration:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  source: Constants.expoConfig?.extra?.supabaseUrl
    ? 'Constants'
    : process.env.EXPO_PUBLIC_SUPABASE_URL
      ? 'env'
      : 'hardcoded',
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration error:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing',
    constants: Constants.expoConfig?.extra || 'no extra config',
    env: {
      url: process.env.EXPO_PUBLIC_SUPABASE_URL ? 'present' : 'missing',
      key: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
    },
  });
}

// Create a safe storage adapter that won't crash during build
const safeAsyncStorage = {
  getItem: async (key: string) => {
    try {
      if (typeof window === 'undefined') return null;
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      if (typeof window === 'undefined') return;
      await AsyncStorage.setItem(key, value);
    } catch {
      // Ignore errors during build
    }
  },
  removeItem: async (key: string) => {
    try {
      if (typeof window === 'undefined') return;
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore errors during build
    }
  },
};

// Create a dummy client if credentials are missing to prevent crashes
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          storage: safeAsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : ({
        auth: {
          signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
          signInWithPassword: async () => ({
            data: null,
            error: new Error('Supabase not configured'),
          }),
          signOut: async () => ({ error: new Error('Supabase not configured') }),
          getUser: async () => ({
            data: { user: null },
            error: new Error('Supabase not configured'),
          }),
          getSession: async () => ({
            data: { session: null },
            error: new Error('Supabase not configured'),
          }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
      } as any);

// Helper functions for common operations
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // In production, users will need to confirm their email
      // This redirect URL is for email confirmation
      emailRedirectTo: 'harvestapp://auth/callback',
      data: {
        // Any additional user metadata can go here
        app_name: 'Harvest',
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const signInWithOAuth = async (provider: 'google' | 'facebook') => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: 'harvestapp://auth/callback',
      skipBrowserRedirect: true, // For mobile apps
    },
  });
  return { data, error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (user) {
    // Get user profile data (stored in 'users' table)
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError);
    }

    // Merge user data with profile data
    return {
      user: {
        ...user,
        ...(profile || {}),
      },
      error,
    };
  }

  return { user, error };
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (session: any) => void) => {
  return supabase.auth.onAuthStateChange((_event: any, session: any) => {
    callback(session);
  });
};
