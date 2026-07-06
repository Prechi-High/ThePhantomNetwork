/**
 * useResize - Hook for resize functionality
 * 
 * Provides GPU-accelerated resizing with constraint support.
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useStudioStore } from '../systems/state/store';
import { clampNormalized } from '../systems/layout/normalizer';
import { ResizeCommand } from '../systems/history/commands/ResizeCommand';
import { commandHistory } from '../systems/history/CommandHistory';
import type { NormalizedPosition, NormalizedSize } from '../systems/state/slices/componentsSlice';

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface ResizeState {
  handle: ResizeHandle;
  startPos: { x: number; y: number };
  startComponentPos: NormalizedPosition;
  startComponentSize: NormalizedSize;
  shiftKey: boolean;
  altKey: boolean;
}

/**
 * useResize provides resize functionality for a component.
 * 
 * Features:
 * - 8 resize handles (corners + midpoints)
 * - Mouse and touch support
 * - Real-time size updates (throttled via RAF)
 * - Shift key: maintain aspect ratio
 * - Alt key: resize from center
 * - Min/max constraint enforcement
 * - Canvas boundary clamping
 * - History integration (undo/redo)
 */
export function useResize(componentId: string) {
  const [isResizing, setIsResizing] = useState(false);
  const resizeState = useRef<ResizeState | null>(null);
  const rafId = useRef<number | null>(null);

  const component = useStudioStore(state => state.components[componentId]);
  const updateComponent = useStudioStore(state => state.updateComponent);
  const viewport = useStudioStore(state => state.viewport);

  /**
   * Handle resize start (mouse or touch)
   */
  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, handle: ResizeHandle) => {
      if (!component || component.locked) return;

      setIsResizing(true);

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      resizeState.current = {
        handle,
        startPos: { x: clientX, y: clientY },
        startComponentPos: { ...component.position },
        startComponentSize: { ...component.size },
        shiftKey: 'shiftKey' in e ? e.shiftKey : false,
        altKey: 'altKey' in e ? e.altKey : false,
      };

      e.preventDefault();
      e.stopPropagation();
    },
    [component]
  );

  /**
   * Handle resize move
   */
  const handleResizeMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isResizing || !resizeState.current || !component) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - resizeState.current.startPos.x;
      const deltaY = clientY - resizeState.current.startPos.y;

      // Convert to normalized deltas
      const normalizedDeltaX = deltaX / viewport.width;
      const normalizedDeltaY = deltaY / viewport.height;

      const { handle, startComponentPos, startComponentSize, shiftKey, altKey } =
        resizeState.current;

      let newX = startComponentPos.x;
      let newY = startComponentPos.y;
      let newWidth = startComponentSize.width;
      let newHeight = startComponentSize.height;

      // Calculate new size based on handle
      switch (handle) {
        case 'nw':
          newX = startComponentPos.x + normalizedDeltaX;
          newY = startComponentPos.y + normalizedDeltaY;
          newWidth = startComponentSize.width - normalizedDeltaX;
          newHeight = startComponentSize.height - normalizedDeltaY;
          break;
        case 'n':
          newY = startComponentPos.y + normalizedDeltaY;
          newHeight = startComponentSize.height - normalizedDeltaY;
          break;
        case 'ne':
          newY = startComponentPos.y + normalizedDeltaY;
          newWidth = startComponentSize.width + normalizedDeltaX;
          newHeight = startComponentSize.height - normalizedDeltaY;
          break;
        case 'e':
          newWidth = startComponentSize.width + normalizedDeltaX;
          break;
        case 'se':
          newWidth = startComponentSize.width + normalizedDeltaX;
          newHeight = startComponentSize.height + normalizedDeltaY;
          break;
        case 's':
          newHeight = startComponentSize.height + normalizedDeltaY;
          break;
        case 'sw':
          newX = startComponentPos.x + normalizedDeltaX;
          newWidth = startComponentSize.width - normalizedDeltaX;
          newHeight = startComponentSize.height + normalizedDeltaY;
          break;
        case 'w':
          newX = startComponentPos.x + normalizedDeltaX;
          newWidth = startComponentSize.width - normalizedDeltaX;
          break;
      }

      // Apply aspect ratio constraint (Shift key)
      if (shiftKey) {
        const aspectRatio = startComponentSize.width / startComponentSize.height;
        if (['nw', 'ne', 'se', 'sw'].includes(handle)) {
          // Corner handles: maintain aspect ratio
          newHeight = newWidth / aspectRatio;
        }
      }

      // Apply min/max constraints
      const minWidth = 0.05; // 5% of canvas
      const minHeight = 0.05;
      const maxWidth = 1.0;
      const maxHeight = 1.0;

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

      // Clamp position to canvas bounds
      newX = clampNormalized(newX);
      newY = clampNormalized(newY);

      // Ensure component doesn't go off canvas
      if (newX + newWidth > 1) {
        newWidth = 1 - newX;
      }
      if (newY + newHeight > 1) {
        newHeight = 1 - newY;
      }

      // Use RAF for smooth updates
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        updateComponent(componentId, {
          position: { x: newX, y: newY },
          size: { width: newWidth, height: newHeight },
        });
      });
    },
    [isResizing, componentId, component, viewport, updateComponent]
  );

  /**
   * Handle resize end
   */
  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return;

    setIsResizing(false);

    // Cancel any pending RAF
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    // Create history command for undo/redo
    if (resizeState.current && component) {
      const oldPos = resizeState.current.startComponentPos;
      const oldSize = resizeState.current.startComponentSize;
      const newPos = component.position;
      const newSize = component.size;

      // Only create command if size/position actually changed
      const changed =
        oldPos.x !== newPos.x ||
        oldPos.y !== newPos.y ||
        oldSize.width !== newSize.width ||
        oldSize.height !== newSize.height;

      if (changed) {
        const command = new ResizeCommand(
          componentId,
          oldPos,
          oldSize,
          newPos,
          newSize,
          (id, pos, size) => {
            useStudioStore.getState().updateComponent(id, { position: pos, size });
          }
        );
        commandHistory.execute(command);
      }
    }

    resizeState.current = null;
  }, [isResizing, componentId, component]);

  // Attach/detach global listeners when resizing
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => handleResizeMove(e);
    const handleTouchMove = (e: TouchEvent) => handleResizeMove(e);
    const handleMouseUp = () => handleResizeEnd();
    const handleTouchEnd = () => handleResizeEnd();

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
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return {
    isResizing,
    handleResizeStart,
  };
}
