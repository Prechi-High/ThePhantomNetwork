/**
 * Edit Mode Wrapper
 * 
 * Wraps the HUD with edit mode functionality and keyboard shortcuts.
 * Renders toggle button and handles mode switching.
 */

'use client';

import type { ReactNode } from 'react';
import { useStudioStore } from '../systems/state/store';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSelection } from '../hooks/useSelection';
import { useValidation } from '../hooks/useValidation';
import { PropertyInspector } from '../panels/PropertyInspector';
import { LayersPanel } from '../panels/LayersPanel';
import { ComponentLibrary } from '../panels/ComponentLibrary';
import { Toolbar } from '../panels/Toolbar';
import { SnapGuidesOverlay } from './SnapGuidesOverlay';
import { SafeAreaGuides } from './SafeAreaGuides';
import styles from '../styles/editor.module.css';

interface EditModeWrapperProps {
  children: ReactNode;
}

export function EditModeWrapper({ children }: EditModeWrapperProps) {
  const { isEditMode, toggleEditMode } = useStudioStore();

  // Setup keyboard shortcuts
  useKeyboard();
  
  // Setup selection management
  useSelection();
  
  // Setup validation
  useValidation();

  return (
    <div className={styles.editorRoot}>
      {/* Edit Mode Toggle Button */}
      <button
        onClick={toggleEditMode}
        className={styles.editModeToggle}
        title="Toggle Edit Mode (Cmd/Ctrl + E)"
        aria-label="Toggle Edit Mode"
      >
        {isEditMode ? (
          <>
            <EditIcon />
            <span>Exit Edit Mode</span>
          </>
        ) : (
          <>
            <EditIcon />
            <span>Edit Mode</span>
          </>
        )}
      </button>

      {/* Edit Mode Indicator */}
      {isEditMode && (
        <div className={styles.editModeIndicator}>
          <div className={styles.indicatorPulse} />
          <span>EDIT MODE</span>
        </div>
      )}

      {/* HUD Content */}
      {children}

      {/* Editor Panels */}
      {isEditMode && (
        <>
          <SafeAreaGuides />
          <SnapGuidesOverlay />
          <Toolbar />
          <PropertyInspector />
          <LayersPanel />
          <ComponentLibrary />
        </>
      )}
    </div>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );
}
