import React, { ReactNode } from 'react';
import useUserStore from '../stores/useUserStore';

export const useUser = () => {
  const {
    currentUser,
    setCurrentUser,
    onboardingData,
    updateOnboardingData,
    clearOnboardingData,
  } = useUserStore();

  return {
    currentUser,
    setCurrentUser,
    onboardingData,
    updateOnboardingData,
    clearOnboardingData,
  };
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  return <>{children}</>;
}; 