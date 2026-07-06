/**
 * Keyboard Shortcuts Hook
 * 
 * Handles all keyboard shortcuts for the HUD Studio.
 */

'use client';

import { useEffect } from 'react';
import { useStudioStore } from '../systems/state/store';
import { commandHistory } from '../systems/history/CommandHistory';

export function useKeyboard() {
  const { toggleEditMode, isEditMode, selectComponent, selectedComponentId } =
    useStudioStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + E: Toggle edit mode
      if (isMod && e.key === 'e') {
        e.preventDefault();
        toggleEditMode();
        return;
      }

      // Only handle these shortcuts in edit mode
      if (!isEditMode) return;

      // Escape: Deselect
      if (e.key === 'Escape') {
        e.preventDefault();
        selectComponent(null);
        return;
      }

      // Cmd/Ctrl + Z: Undo
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        commandHistory.undo();
        return;
      }

      // Cmd/Ctrl + Shift + Z: Redo
      if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        commandHistory.redo();
        return;
      }

      // Delete/Backspace: Delete selected (future implementation)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponentId) {
        e.preventDefault();
        // TODO: Implement delete command
        return;
      }

      // Cmd/Ctrl + D: Duplicate selected (future implementation)
      if (isMod && e.key === 'd' && selectedComponentId) {
        e.preventDefault();
        // TODO: Implement duplicate command
        return;
      }

      // Arrow keys: Nudge selected (future implementation)
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (selectedComponentId) {
          e.preventDefault();
          // const step = e.shiftKey ? 10 : 1;
          // TODO: Implement nudge command
          return;
        }
      }

      // S: Toggle snap (future implementation)
      if (e.key === 's' && !isMod) {
        e.preventDefault();
        // TODO: Toggle snap
        return;
      }

      // G: Toggle grid (future implementation)
      if (e.key === 'g' && !isMod) {
        e.preventDefault();
        // TODO: Toggle grid
        return;
      }

      // R: Toggle rulers (future implementation)
      if (e.key === 'r' && !isMod) {
        e.preventDefault();
        // TODO: Toggle rulers
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditMode, selectedComponentId, toggleEditMode, selectComponent]);
}
