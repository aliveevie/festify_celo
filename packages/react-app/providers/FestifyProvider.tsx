"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useFestify } from '@/contexts/useFestify';

// Create context with default values
const FestifyContext = createContext<ReturnType<typeof useFestify> | undefined>(undefined);

// Provider component
export function FestifyProvider({ children }: { children: ReactNode }) {
  const festifyValues = useFestify();

  return (
    <FestifyContext.Provider value={festifyValues}>
      {children}
    </FestifyContext.Provider>
  );
}

// Custom hook to use the Festify context
export function useFestifyContext() {
  const context = useContext(FestifyContext);
  if (context === undefined) {
    throw new Error('useFestifyContext must be used within a FestifyProvider');
  }
  return context;
}
