/**
 * HUD Studio Provider
 * 
 * Root wrapper that enables the HUD Studio for development.
 * In production, this simply renders children without any studio overhead.
 */

'use client';

import type { ReactNode } from 'react';
import { HUDStudioContextProvider, useHUDStudioContext } from './HUDStudioContext';
import { EditModeWrapper } from './core/EditModeWrapper';

interface HUDStudioProviderProps {
  children: ReactNode;
}

function HUDStudioProviderInner({ children }: HUDStudioProviderProps) {
  const { isEnabled } = useHUDStudioContext();

  // In production or when disabled, just render children
  if (!isEnabled) {
    return <>{children}</>;
  }

  // In development, wrap with edit mode functionality
  return <EditModeWrapper>{children}</EditModeWrapper>;
}

export function HUDStudioProvider({ children }: HUDStudioProviderProps) {
  return (
    <HUDStudioContextProvider>
      <HUDStudioProviderInner>{children}</HUDStudioProviderInner>
    </HUDStudioContextProvider>
  );
}
