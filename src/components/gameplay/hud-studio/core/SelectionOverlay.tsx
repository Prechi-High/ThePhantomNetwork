/**
 * SelectionOverlay - Visual feedback for selected components
 * 
 * Shows selection outline, resize handles, and component info.
 */

'use client';

import { useRef, useEffect } from 'react';
import { useStudioStore } from '../systems/state/store';
import { normalizedToPixels } from '../systems/layout/normalizer';
import { useDragDrop } from '../hooks/useDragDrop';
import { useResize } from '../hooks/useResize';
import type { NormalizedPosition, NormalizedSize } from '../systems/state/slices/componentsSlice';
import styles from '../styles/overlays.module.css';

export interface SelectionOverlayProps {
  instanceId: string;
  position: NormalizedPosition;
  size: NormalizedSize;
  locked: boolean;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const RESIZE_HANDLES: ResizeHandle[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

/**
 * SelectionOverlay shows visual feedback for the selected component.
 * 
 * Features:
 * - Selection outline (purple glow)
 * - 8 resize handles (corners + midpoints)
 * - Component name label
 * - Dimension display
 * - Drag behavior (when not locked)
 */
export function SelectionOverlay({
  instanceId,
  position,
  size,
  locked,
}: SelectionOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const viewport = useStudioStore(state => state.viewport);
  const component = useStudioStore(state => state.components[instanceId]);
  const componentMetadata = useStudioStore(state => {
    const comp = state.components[instanceId];
    if (!comp) return null;
    // In a real implementation, you'd fetch this from the registry
    return { displayName: comp.componentId };
  });

  const { isDragging, handleDragStart } = useDragDrop(instanceId);
  const { isResizing, handleResizeStart } = useResize(instanceId);

  // Position the overlay to match the component
  useEffect(() => {
    if (!overlayRef.current) return;

    const canvasSize = {
      width: viewport.width,
      height: viewport.height,
    };

    const pixels = normalizedToPixels(
      { x: position.x, y: position.y, width: size.width, height: size.height },
      canvasSize
    );

    overlayRef.current.style.transform = `translate3d(${pixels.x}px, ${pixels.y}px, 0)`;
    overlayRef.current.style.width = `${pixels.width}px`;
    overlayRef.current.style.height = `${pixels.height}px`;
  }, [position, size, viewport]);

  if (!component) return null;

  const pixels = normalizedToPixels(
    { x: position.x, y: position.y, width: size.width, height: size.height },
    { width: viewport.width, height: viewport.height }
  );

  const displayName = componentMetadata?.displayName || instanceId;

  return (
    <div
      ref={overlayRef}
      className={styles.selectionOverlay}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    >
      {/* Selection outline */}
      <div 
        className={styles.selectionOutline}
        onMouseDown={!locked ? handleDragStart : undefined}
        onTouchStart={!locked ? handleDragStart : undefined}
        style={{
          pointerEvents: locked ? 'none' : 'auto',
          cursor: locked ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
        }}
      />

      {/* Component info label */}
      <div className={styles.componentLabel}>
        {locked && <span className={styles.lockIcon}>🔒</span>}
        <span className={styles.componentName}>{displayName}</span>
        <span className={styles.componentDimensions}>
          {Math.round(pixels.width)} × {Math.round(pixels.height)}
        </span>
      </div>

      {/* Resize handles (only if not locked) */}
      {!locked && (
        <>
          {RESIZE_HANDLES.map((handle) => (
            <div
              key={handle}
              className={`${styles.resizeHandle} ${styles[`handle-${handle}`]}`}
              data-handle={handle}
              onMouseDown={(e) => handleResizeStart(e, handle)}
              onTouchStart={(e) => handleResizeStart(e, handle)}
              style={{
                cursor: getResizeCursor(handle),
                pointerEvents: 'auto',
              }}
            />
          ))}
        </>
      )}

      {/* Dimension display during resize */}
      {isResizing && (
        <div className={styles.resizeDimensions}>
          {Math.round(pixels.width)} × {Math.round(pixels.height)}
        </div>
      )}
    </div>
  );
}

/**
 * Get the appropriate cursor for each resize handle
 */
function getResizeCursor(handle: ResizeHandle): string {
  switch (handle) {
    case 'nw':
    case 'se':
      return 'nwse-resize';
    case 'ne':
    case 'sw':
      return 'nesw-resize';
    case 'n':
    case 's':
      return 'ns-resize';
    case 'e':
    case 'w':
      return 'ew-resize';
    default:
      return 'default';
  }
}
