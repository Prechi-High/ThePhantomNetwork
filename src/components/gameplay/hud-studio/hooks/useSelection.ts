/**
 * useSelection - Hook for managing component selection
 * 
 * Handles selection, deselection, and keyboard shortcuts.
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useStudioStore } from '../systems/state/store';

/**
 * useSelection provides selection management functionality.
 * 
 * Features:
 * - Click canvas to deselect
 * - Escape key to deselect
 * - Delete key to remove component
 * - Arrow keys to nudge (1px or 10px with Shift)
 */
export function useSelection() {
  const isEditMode = useStudioStore(state => state.isEditMode);
  const selectedId = useStudioStore(state => state.selectedComponentId);
  const selectComponent = useStudioStore(state => state.selectComponent);
  const removeComponent = useStudioStore(state => state.removeComponent);
  const updateComponent = useStudioStore(state => state.updateComponent);
  const component = useStudioStore(state => 
    selectedId ? state.components[selectedId] : null
  );
  const viewport = useStudioStore(state => state.viewport);

  // Handle background click to deselect
  const handleCanvasClick = useCallback((e: MouseEvent) => {
    if (!isEditMode) return;

    // Check if click was on canvas background (not a component)
    const target = e.target as HTMLElement;
    const isComponent = target.closest('[data-component-id]');
    
    if (!isComponent) {
      selectComponent(null);
    }
  }, [isEditMode, selectComponent]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEditMode || !selectedId || !component) return;

    // Escape: Deselect
    if (e.key === 'Escape') {
      selectComponent(null);
      return;
    }

    // Delete/Backspace: Remove component
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Don't delete if locked
      if (component.locked) return;

      // Don't delete if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      e.preventDefault();
      removeComponent(selectedId);
      selectComponent(null);
      return;
    }

    // Arrow keys: Nudge position
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      if (component.locked) return;

      e.preventDefault();

      const nudgeAmount = e.shiftKey ? 10 : 1;
      const normalizedNudge = nudgeAmount / viewport.width;

      let newX = component.position.x;
      let newY = component.position.y;

      switch (e.key) {
        case 'ArrowUp':
          newY -= normalizedNudge;
          break;
        case 'ArrowDown':
          newY += normalizedNudge;
          break;
        case 'ArrowLeft':
          newX -= normalizedNudge;
          break;
        case 'ArrowRight':
          newX += normalizedNudge;
          break;
      }

      // Clamp to canvas bounds
      newX = Math.max(0, Math.min(1, newX));
      newY = Math.max(0, Math.min(1, newY));

      updateComponent(selectedId, {
        position: { x: newX, y: newY },
      });
    }
  }, [isEditMode, selectedId, component, selectComponent, removeComponent, updateComponent, viewport]);

  // Attach/detach event listeners
  useEffect(() => {
    if (!isEditMode) return;

    document.addEventListener('click', handleCanvasClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleCanvasClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditMode, handleCanvasClick, handleKeyDown]);

  return {
    selectedId,
    selectComponent,
  };
}
