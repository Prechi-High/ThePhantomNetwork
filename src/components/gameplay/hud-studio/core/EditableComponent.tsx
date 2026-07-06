/**
 * EditableComponent - Wraps HUD components to make them editable
 * 
 * This wrapper adds selection, drag, and resize capabilities to any registered component.
 * Only active in edit mode.
 */

'use client';

import { useRef, useEffect, type ReactNode } from 'react';
import { useStudioStore } from '../systems/state/store';
import { normalizedToPixels } from '../systems/layout/normalizer';
import { applyTransform } from './TransformEngine';
import { SelectionOverlay } from './SelectionOverlay';
import styles from '../styles/overlays.module.css';

export interface EditableComponentProps {
  instanceId: string;
  children: ReactNode;
  className?: string;
}

/**
 * EditableComponent wraps a HUD component and makes it editable in edit mode.
 * 
 * Features:
 * - Click to select
 * - Shows selection overlay with handles
 * - Applies position/size from store
 * - GPU-accelerated transforms
 * - Only active in edit mode
 */
export function EditableComponent({ 
  instanceId, 
  children, 
  className = '' 
}: EditableComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isEditMode = useStudioStore(state => state.isEditMode);
  const component = useStudioStore(state => state.components[instanceId]);
  const selectedId = useStudioStore(state => state.selectedComponentId);
  const viewport = useStudioStore(state => state.viewport);
  const selectComponent = useStudioStore(state => state.selectComponent);

  const isSelected = selectedId === instanceId;

  // Handle click to select
  const handleClick = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    
    e.stopPropagation();
    selectComponent(instanceId);
  };

  // Apply transforms when component data changes
  useEffect(() => {
    if (!containerRef.current || !component || !isEditMode) return;

    const canvasSize = {
      width: viewport.width,
      height: viewport.height,
    };

    applyTransform(
      containerRef.current,
      component.position,
      component.size,
      canvasSize,
      {
        scale: component.styleOverrides.scale,
        opacity: component.opacity,
      }
    );

    // Apply additional style overrides
    if (component.styleOverrides.borderRadius) {
      containerRef.current.style.borderRadius = `${component.styleOverrides.borderRadius}px`;
    }
    if (component.styleOverrides.blur) {
      containerRef.current.style.backdropFilter = `blur(${component.styleOverrides.blur}px)`;
    }
    if (component.styleOverrides.borderWidth && component.styleOverrides.borderColor) {
      containerRef.current.style.border = `${component.styleOverrides.borderWidth}px solid ${component.styleOverrides.borderColor}`;
    }

    // Apply visibility
    containerRef.current.style.display = component.visible ? 'block' : 'none';

  }, [component, viewport, isEditMode]);

  // If not in edit mode, render children normally
  if (!isEditMode || !component) {
    return <>{children}</>;
  }

  const containerClasses = [
    styles.editableComponent,
    isSelected ? styles.selected : '',
    component.locked ? styles.locked : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <>
      <div
        ref={containerRef}
        className={containerClasses}
        onClick={handleClick}
        data-component-id={instanceId}
        style={{
          position: 'absolute',
          cursor: component.locked ? 'not-allowed' : 'pointer',
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        {children}
      </div>

      {/* Show selection overlay when selected */}
      {isSelected && (
        <SelectionOverlay
          instanceId={instanceId}
          position={component.position}
          size={component.size}
          locked={component.locked}
        />
      )}
    </>
  );
}
