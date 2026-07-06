/**
 * GridSnap - Grid-based snapping
 * 
 * Provides snapping to a configurable grid.
 */

import type { NormalizedPosition } from '../state/slices/componentsSlice';
import type { SnapTarget } from './types';

export class GridSnap {
  /**
   * Calculate snap targets for grid snapping
   * 
   * @param position - Current position in normalized coordinates
   * @param gridSize - Grid size in pixels
   * @param canvasWidth - Canvas width in pixels
   * @param canvasHeight - Canvas height in pixels
   * @returns Array of snap targets
   */
  static getGridSnapTargets(
    position: NormalizedPosition,
    gridSize: number,
    canvasWidth: number,
    canvasHeight: number
  ): { x: SnapTarget[]; y: SnapTarget[] } {
    const xTargets: SnapTarget[] = [];
    const yTargets: SnapTarget[] = [];

    // Convert normalized position to pixels
    const pixelX = position.x * canvasWidth;
    const pixelY = position.y * canvasHeight;

    // Calculate nearest grid lines
    const gridCountX = Math.ceil(canvasWidth / gridSize);
    const gridCountY = Math.ceil(canvasHeight / gridSize);

    // Find nearby grid lines within threshold
    for (let i = 0; i <= gridCountX; i++) {
      const gridPixelX = i * gridSize;
      const normalizedX = gridPixelX / canvasWidth;
      
      xTargets.push({
        position: normalizedX,
        type: 'grid',
        label: `Grid ${i}`,
      });
    }

    for (let i = 0; i <= gridCountY; i++) {
      const gridPixelY = i * gridSize;
      const normalizedY = gridPixelY / canvasHeight;
      
      yTargets.push({
        position: normalizedY,
        type: 'grid',
        label: `Grid ${i}`,
      });
    }

    return { x: xTargets, y: yTargets };
  }

  /**
   * Snap a position to the nearest grid
   * 
   * @param position - Current position
   * @param gridSize - Grid size in pixels
   * @param canvasWidth - Canvas width in pixels
   * @param canvasHeight - Canvas height in pixels
   * @param threshold - Snap threshold in pixels
   * @returns Snapped position or original if no snap
   */
  static snapToGrid(
    position: NormalizedPosition,
    gridSize: number,
    canvasWidth: number,
    canvasHeight: number,
    threshold: number = 8
  ): NormalizedPosition {
    const pixelX = position.x * canvasWidth;
    const pixelY = position.y * canvasHeight;

    // Calculate nearest grid positions
    const nearestGridX = Math.round(pixelX / gridSize) * gridSize;
    const nearestGridY = Math.round(pixelY / gridSize) * gridSize;

    // Check if within threshold
    const snapX = Math.abs(pixelX - nearestGridX) <= threshold;
    const snapY = Math.abs(pixelY - nearestGridY) <= threshold;

    return {
      x: snapX ? nearestGridX / canvasWidth : position.x,
      y: snapY ? nearestGridY / canvasHeight : position.y,
    };
  }

  /**
   * Get all grid lines for rendering
   * 
   * @param gridSize - Grid size in pixels
   * @param canvasWidth - Canvas width in pixels
   * @param canvasHeight - Canvas height in pixels
   * @returns Array of normalized grid positions
   */
  static getGridLines(
    gridSize: number,
    canvasWidth: number,
    canvasHeight: number
  ): { x: number[]; y: number[] } {
    const xLines: number[] = [];
    const yLines: number[] = [];

    const gridCountX = Math.ceil(canvasWidth / gridSize);
    const gridCountY = Math.ceil(canvasHeight / gridSize);

    for (let i = 0; i <= gridCountX; i++) {
      xLines.push((i * gridSize) / canvasWidth);
    }

    for (let i = 0; i <= gridCountY; i++) {
      yLines.push((i * gridSize) / canvasHeight);
    }

    return { x: xLines, y: yLines };
  }
}
