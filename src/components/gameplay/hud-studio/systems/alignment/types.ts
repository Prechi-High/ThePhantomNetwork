/**
 * Alignment System Types
 * 
 * Type definitions for alignment and distribution operations.
 */

import type { NormalizedPosition, NormalizedSize } from '../state/slices/componentsSlice';

/**
 * Alignment operation types
 */
export type AlignmentType =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'center-horizontal'
  | 'center-vertical'
  | 'center-both';

/**
 * Distribution operation types
 */
export type DistributionType =
  | 'horizontal'
  | 'vertical';

/**
 * Size matching types
 */
export type SizeMatchType =
  | 'width'
  | 'height'
  | 'both';

/**
 * Component bounds for alignment calculations
 */
export interface ComponentBounds {
  id: string;
  position: NormalizedPosition;
  size: NormalizedSize;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

/**
 * Alignment result for a single component
 */
export interface AlignmentResult {
  componentId: string;
  position: NormalizedPosition;
  size?: NormalizedSize; // Optional for size matching
}

/**
 * Batch alignment result
 */
export interface BatchAlignmentResult {
  results: AlignmentResult[];
  description: string;
}
