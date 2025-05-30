// src/contexts/EnvironmentContext.tsx
"use client";

import type { EnvironmentKey, EnvironmentConfig } from '@/config/environments'; // Import EnvironmentConfig
import { DEFAULT_ENVIRONMENT, ENVIRONMENTS } from '@/config/environments';
import type { Dispatch, ReactNode, SetStateAction} from 'react';
import { createContext, useContext, useState, useMemo } from 'react';

interface EnvironmentContextType {
  selectedEnvironment: EnvironmentKey;
  setSelectedEnvironment: Dispatch<SetStateAction<EnvironmentKey>>;
  currentConfig: EnvironmentConfig; // Changed from currentUrls to currentConfig
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentKey>(DEFAULT_ENVIRONMENT);

  const currentConfig = useMemo(() => { // Changed from currentUrls to currentConfig
    return ENVIRONMENTS[selectedEnvironment];
  }, [selectedEnvironment]);

  return (
    <EnvironmentContext.Provider value={{ selectedEnvironment, setSelectedEnvironment, currentConfig }}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = (): EnvironmentContextType => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};
