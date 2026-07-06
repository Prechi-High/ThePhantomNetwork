/**
 * useDragDrop - Hook for drag and drop functionality
 * 
 * Provides GPU-accelerated dragging with snapping support.
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useStudioStore } from '../systems/state/store';
import { clampNormalized } from '../systems/layout/normalizer';
import { MoveCommand } from '../systems/history/commands/MoveCommand';
import { commandHistory } from '../systems/history/CommandHistory';
import { SnapEngine } from '../systems/snap/SnapEngine';
import type { NormalizedPosition } from '../systems/state/slices/componentsSlice';

/**
 * useDragDrop provides drag and drop functionality for a component.
 * 
 * Features:
 * - Mouse and touch support
 * - Real-time position updates (throttled via RAF)
 * - GPU-accelerated transforms during drag
 * - Canvas boundary clamping
 * - Snap support (grid, components, safe areas)
 * - History integration (undo/redo)
 * - Locked component protection
 */
export function useDragDrop(componentId: string) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const componentStartPos = useRef<NormalizedPosition | null>(null);
  const rafId = useRef<number | null>(null);

  const component = useStudioStore(state => state.components[componentId]);
  const components = useStudioStore(state => state.components);
  const updateComponent = useStudioStore(state => state.updateComponent);
  const editorSettings = useStudioStore(state => state.editorSettings);
  const viewport = useStudioStore(state => state.viewport);
  const setActiveSnapLines = useStudioStore(state => state.setActiveSnapLines);

  /**
   * Handle drag start (mouse or touch)
   */
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!component || component.locked) return;

    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    dragStartPos.current = { x: clientX, y: clientY };
    componentStartPos.current = { ...component.position };

    e.preventDefault();
    e.stopPropagation();
  }, [component]);

  /**
   * Handle drag move
   */
  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging || !dragStartPos.current || !componentStartPos.current) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;

    // Convert pixel delta to normalized delta
    const normalizedDeltaX = deltaX / viewport.width;
    const normalizedDeltaY = deltaY / viewport.height;

    let newX = componentStartPos.current.x + normalizedDeltaX;
    let newY = componentStartPos.current.y + normalizedDeltaY;

    // Apply snapping if enabled
    if (editorSettings.snapEnabled) {
      const snapResult = SnapEngine.applySnapping(
        { x: newX, y: newY },
        componentId,
        components,
        {
          enabled: editorSettings.snapEnabled,
          snapToGrid: editorSettings.snapToGrid,
          snapToComponents: editorSettings.snapToComponents,
          snapToSafeArea: editorSettings.snapToSafeArea,
          gridSize: editorSettings.gridSize,
          threshold: 8, // 8px snap threshold
        },
        viewport.width,
        viewport.height
      );
      
      newX = snapResult.position.x;
      newY = snapResult.position.y;
      setActiveSnapLines(snapResult.snapLines);
    } else {
      setActiveSnapLines([]);
    }

    // Clamp to canvas bounds (0-1)
    newX = clampNormalized(newX);
    newY = clampNormalized(newY);

    // Use RAF for smooth updates
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      updateComponent(componentId, {
        position: { x: newX, y: newY },
      });
    });
  }, [isDragging, componentId, viewport, editorSettings, updateComponent]);

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    setActiveSnapLines([]); // Clear snap lines

    // Cancel any pending RAF
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    // Create history command for undo/redo
    if (componentStartPos.current && component) {
      const oldPosition = componentStartPos.current;
      const newPosition = component.position;

      // Only create command if position actually changed
      if (oldPosition.x !== newPosition.x || oldPosition.y !== newPosition.y) {
        const command = new MoveCommand(
          componentId,
          oldPosition,
          newPosition,
          (id, pos) => {
            useStudioStore.getState().updateComponent(id, { position: pos });
          }
        );
        commandHistory.execute(command);
      }
    }

    dragStartPos.current = null;
    componentStartPos.current = null;
  }, [isDragging, componentId, component]);

  // Attach/detach global listeners when dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e);
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return {
    isDragging,
    handleDragStart,
  };
}
