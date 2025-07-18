import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DemoUser } from '../data/demoUsers';

interface UserState {
  currentUser: DemoUser | null;
  onboardingData: Partial<DemoUser>;
  setCurrentUser: (user: DemoUser | null) => void;
  updateOnboardingData: (data: Partial<DemoUser>) => void;
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
          onboardingData: { ...state.onboardingData, ...data }
        })),
      
      clearOnboardingData: () => set({ onboardingData: {} }),
      
      logout: () => set({ currentUser: null, onboardingData: {} }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        currentUser: state.currentUser 
      }),
    }
  )
);

export default useUserStore;