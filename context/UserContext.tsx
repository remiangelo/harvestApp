import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DemoUser, getDemoUserByEmail } from '../data/demoUsers';

interface UserContextType {
  currentUser: DemoUser | null;
  setCurrentUser: (user: DemoUser | null) => void;
  onboardingData: Partial<DemoUser>;
  updateOnboardingData: (data: Partial<DemoUser>) => void;
  clearOnboardingData: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null);
  const [onboardingData, setOnboardingData] = useState<Partial<DemoUser>>({});

  const updateOnboardingData = (data: Partial<DemoUser>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const clearOnboardingData = () => {
    setOnboardingData({});
  };

  const value = {
    currentUser,
    setCurrentUser,
    onboardingData,
    updateOnboardingData,
    clearOnboardingData,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 