/**
 * Snap System Types
 * 
 * Type definitions for the snapping system.
 */

import type { NormalizedPosition, NormalizedSize } from '../state/slices/componentsSlice';

/**
 * Snap result containing the snapped position and metadata
 */
export interface SnapResult {
  position: NormalizedPosition;
  snapped: boolean;
  snapLines: SnapLine[];
}

/**
 * Visual snap guide line
 */
export interface SnapLine {
  type: 'horizontal' | 'vertical';
  position: number; // Normalized position (0-1)
  color: string;
  label?: string;
}

/**
 * Snap candidate for edge snapping
 */
export interface SnapCandidate {
  componentId: string;
  edges: {
    left: number;
    right: number;
    top: number;
    bottom: number;
    centerX: number;
    centerY: number;
  };
}

/**
 * Snap target with metadata
 */
export interface SnapTarget {
  position: number;
  type: SnapType;
  componentId?: string;
  label?: string;
}

/**
 * Types of snap targets
 */
export type SnapType = 
  | 'grid'
  | 'component-edge'
  | 'component-center'
  | 'canvas-center'
  | 'safe-area';

/**
 * Snap configuration
 */
export interface SnapConfig {
  enabled: boolean;
  snapToGrid: boolean;
  snapToComponents: boolean;
  snapToSafeArea: boolean;
  gridSize: number; // In pixels
  threshold: number; // In pixels (default: 8)
}

/**
 * Bounding box for snap calculations
 */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
}
