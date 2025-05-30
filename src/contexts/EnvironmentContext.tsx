// src/contexts/EnvironmentContext.tsx
"use client";

import type { EnvironmentKey } from '@/config/environments';
import { DEFAULT_ENVIRONMENT, ENVIRONMENTS } from '@/config/environments';
import type { Dispatch, ReactNode, SetStateAction} from 'react';
import { createContext, useContext, useState, useMemo } from 'react';

interface EnvironmentContextType {
  selectedEnvironment: EnvironmentKey;
  setSelectedEnvironment: Dispatch<SetStateAction<EnvironmentKey>>;
  currentUrls: {
    gateway: string;
    api: string;
    explorer: string;
  };
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export const EnvironmentProvider = ({ children }: { children: ReactNode }) => {
  const [selectedEnvironment, setSelectedEnvironment] = useState<EnvironmentKey>(DEFAULT_ENVIRONMENT);

  const currentUrls = useMemo(() => {
    return ENVIRONMENTS[selectedEnvironment];
  }, [selectedEnvironment]);

  return (
    <EnvironmentContext.Provider value={{ selectedEnvironment, setSelectedEnvironment, currentUrls }}>
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
