/**
 * HUD Studio Context
 * 
 * Provides environment detection and shared context for the studio.
 */

'use client';

import { createContext, useContext, type ReactNode } from 'react';

interface HUDStudioContextValue {
  isDevMode: boolean;
  isEnabled: boolean;
}

const HUDStudioContext = createContext<HUDStudioContextValue>({
  isDevMode: false,
  isEnabled: false,
});

export function useHUDStudioContext() {
  return useContext(HUDStudioContext);
}

interface HUDStudioContextProviderProps {
  children: ReactNode;
}

export function HUDStudioContextProvider({ children }: HUDStudioContextProviderProps) {
  const isDevMode = process.env.NODE_ENV === 'development';
  const isEnabled =
    isDevMode && process.env.NEXT_PUBLIC_ENABLE_HUD_STUDIO !== 'false';

  return (
    <HUDStudioContext.Provider value={{ isDevMode, isEnabled }}>
      {children}
    </HUDStudioContext.Provider>
  );
}
