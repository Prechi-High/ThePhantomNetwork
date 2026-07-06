/**
 * CenterGuides - Canvas center guide snapping
 * 
 * Provides snapping to canvas horizontal and vertical centers.
 */

import type { NormalizedPosition } from '../state/slices/componentsSlice';
import type { SnapTarget } from './types';

export class CenterGuides {
  /**
   * Get canvas center snap targets
   * 
   * @param position - Current position
   * @param size - Component size
   * @returns Snap targets for canvas center
   */
  static getCenterSnapTargets(
    position: NormalizedPosition,
    size: { width: number; height: number }
  ): { x: SnapTarget[]; y: SnapTarget[] } {
    // Canvas center is always at 0.5, 0.5 in normalized coordinates
    const canvasCenterX = 0.5;
    const canvasCenterY = 0.5;

    // Calculate position that would center the component
    const centerPositionX = canvasCenterX - size.width / 2;
    const centerPositionY = canvasCenterY - size.height / 2;

    return {
      x: [
        {
          position: centerPositionX,
          type: 'canvas-center',
          label: 'Canvas Center X',
        },
      ],
      y: [
        {
          position: centerPositionY,
          type: 'canvas-center',
          label: 'Canvas Center Y',
        },
      ],
    };
  }

  /**
   * Snap to canvas center
   * 
   * @param position - Current position
   * @param size - Component size
   * @param threshold - Snap threshold (normalized)
   * @returns Snapped position or original if no snap
   */
  static snapToCenter(
    position: NormalizedPosition,
    size: { width: number; height: number },
    threshold: number
  ): NormalizedPosition {
    const targets = this.getCenterSnapTargets(position, size);

    let snappedX = position.x;
    let snappedY = position.y;

    // Check X center snap
    const centerTargetX = targets.x[0];
    const distanceX = Math.abs(position.x - centerTargetX.position);
    if (distanceX < threshold) {
      snappedX = centerTargetX.position;
    }

    // Check Y center snap
    const centerTargetY = targets.y[0];
    const distanceY = Math.abs(position.y - centerTargetY.position);
    if (distanceY < threshold) {
      snappedY = centerTargetY.position;
    }

    return {
      x: snappedX,
      y: snappedY,
    };
  }

  /**
   * Get center guide lines for rendering
   * 
   * @returns Normalized positions of center lines
   */
  static getCenterLines(): { x: number; y: number } {
    return {
      x: 0.5,
      y: 0.5,
    };
  }

  /**
   * Check if position is snapped to center
   * 
   * @param position - Current position
   * @param size - Component size
   * @param threshold - Snap threshold (normalized)
   * @returns Whether component is centered on X or Y
   */
  static isSnappedToCenter(
    position: NormalizedPosition,
    size: { width: number; height: number },
    threshold: number
  ): { x: boolean; y: boolean } {
    const componentCenterX = position.x + size.width / 2;
    const componentCenterY = position.y + size.height / 2;

    return {
      x: Math.abs(componentCenterX - 0.5) < threshold,
      y: Math.abs(componentCenterY - 0.5) < threshold,
    };
  }
}
