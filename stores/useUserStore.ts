import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/profile';

interface UserState {
  currentUser: (User & { id?: string }) | null;
  onboardingData: Partial<User>;
  setCurrentUser: (user: (User & { id?: string }) | null) => void;
  updateOnboardingData: (data: Partial<User>) => void;
  clearOnboardingData: () => void;
  logout: () => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      onboardingData: {},

      setCurrentUser: (user) => set({ currentUser: user }),

      updateOnboardingData: (data) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, ...data },
        })),

      clearOnboardingData: () => set({ onboardingData: {} }),

      logout: () => set({ currentUser: null, onboardingData: {} }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentUser: state.currentUser,
      }),
    }
  )
);

export default useUserStore;
