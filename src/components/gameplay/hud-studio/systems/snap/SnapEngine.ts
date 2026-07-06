/**
 * SnapEngine - Main snap coordination engine
 * 
 * Coordinates all snap systems (grid, edges, center, safe areas).
 */

import type { ComponentInstance, NormalizedPosition } from '../state/slices/componentsSlice';
import type { SnapResult, SnapConfig, SnapLine } from './types';
import { GridSnap } from './GridSnap';
import { EdgeSnap } from './EdgeSnap';
import { CenterGuides } from './CenterGuides';

export class SnapEngine {
  /**
   * Apply all enabled snap systems to a position
   * 
   * @param position - Current position to snap
   * @param componentId - ID of component being moved
   * @param components - All component instances
   * @param config - Snap configuration
   * @param canvasWidth - Canvas width in pixels
   * @param canvasHeight - Canvas height in pixels
   * @returns Snap result with snapped position and visual guides
   */
  static applySnapping(
    position: NormalizedPosition,
    componentId: string,
    components: Record<string, ComponentInstance>,
    config: SnapConfig,
    canvasWidth: number,
    canvasHeight: number
  ): SnapResult {
    if (!config.enabled) {
      return {
        position,
        snapped: false,
        snapLines: [],
      };
    }

    const component = components[componentId];
    if (!component) {
      return {
        position,
        snapped: false,
        snapLines: [],
      };
    }

    let snappedPosition = { ...position };
    const snapLines: SnapLine[] = [];
    let hasSnapped = false;

    // Convert threshold from pixels to normalized
    const normalizedThreshold = config.threshold / canvasWidth;

    // 1. Grid snapping (lowest priority)
    if (config.snapToGrid) {
      const gridSnapped = GridSnap.snapToGrid(
        snappedPosition,
        config.gridSize,
        canvasWidth,
        canvasHeight,
        config.threshold
      );

      if (gridSnapped.x !== snappedPosition.x) {
        snappedPosition.x = gridSnapped.x;
        hasSnapped = true;
        snapLines.push({
          type: 'vertical',
          position: gridSnapped.x,
          color: '#00ff0040',
          label: 'Grid',
        });
      }

      if (gridSnapped.y !== snappedPosition.y) {
        snappedPosition.y = gridSnapped.y;
        hasSnapped = true;
        snapLines.push({
          type: 'horizontal',
          position: gridSnapped.y,
          color: '#00ff0040',
          label: 'Grid',
        });
      }
    }

    // 2. Center guide snapping (medium priority)
    const centerSnapped = CenterGuides.snapToCenter(
      snappedPosition,
      component.size,
      normalizedThreshold
    );

    if (centerSnapped.x !== snappedPosition.x) {
      snappedPosition.x = centerSnapped.x;
      hasSnapped = true;
      snapLines.push({
        type: 'vertical',
        position: 0.5,
        color: '#ff00ff80',
        label: 'Center',
      });
    }

    if (centerSnapped.y !== snappedPosition.y) {
      snappedPosition.y = centerSnapped.y;
      hasSnapped = true;
      snapLines.push({
        type: 'horizontal',
        position: 0.5,
        color: '#ff00ff80',
        label: 'Center',
      });
    }

    // 3. Component edge snapping (highest priority)
    if (config.snapToComponents) {
      const candidates = EdgeSnap.getSnapCandidates(components, componentId);
      const edgeSnapped = EdgeSnap.snapToEdges(
        snappedPosition,
        component.size,
        candidates,
        normalizedThreshold
      );

      if (edgeSnapped.x !== snappedPosition.x) {
        snappedPosition.x = edgeSnapped.x;
        hasSnapped = true;
        snapLines.push({
          type: 'vertical',
          position: edgeSnapped.x,
          color: '#00ffff80',
          label: 'Edge',
        });
      }

      if (edgeSnapped.y !== snappedPosition.y) {
        snappedPosition.y = edgeSnapped.y;
        hasSnapped = true;
        snapLines.push({
          type: 'horizontal',
          position: edgeSnapped.y,
          color: '#00ffff80',
          label: 'Edge',
        });
      }
    }

    // TODO: Safe area snapping
    // if (config.snapToSafeArea) {
    //   // Implement safe area snapping
    // }

    return {
      position: snappedPosition,
      snapped: hasSnapped,
      snapLines,
    };
  }

  /**
   * Get all potential snap targets for visualization
   * 
   * @param componentId - ID of component being moved
   * @param components - All component instances
   * @param config - Snap configuration
   * @param canvasWidth - Canvas width in pixels
   * @param canvasHeight - Canvas height in pixels
   * @returns All snap targets for X and Y axes
   */
  static getAllSnapTargets(
    componentId: string,
    components: Record<string, ComponentInstance>,
    config: SnapConfig,
    canvasWidth: number,
    canvasHeight: number
  ) {
    const component = components[componentId];
    if (!component) return { x: [], y: [] };

    let xTargets: unknown[] = [];
    let yTargets: unknown[] = [];

    // Grid targets
    if (config.snapToGrid) {
      const gridTargets = GridSnap.getGridSnapTargets(
        component.position,
        config.gridSize,
        canvasWidth,
        canvasHeight
      );
      xTargets = [...xTargets, ...gridTargets.x];
      yTargets = [...yTargets, ...gridTargets.y];
    }

    // Center targets
    const centerTargets = CenterGuides.getCenterSnapTargets(
      component.position,
      component.size
    );
    xTargets = [...xTargets, ...centerTargets.x];
    yTargets = [...yTargets, ...centerTargets.y];

    // Edge targets
    if (config.snapToComponents) {
      const candidates = EdgeSnap.getSnapCandidates(components, componentId);
      const edgeTargets = EdgeSnap.getEdgeSnapTargets(
        component.position,
        component.size,
        candidates
      );
      xTargets = [...xTargets, ...edgeTargets.x];
      yTargets = [...yTargets, ...edgeTargets.y];
    }

    return { x: xTargets, y: yTargets };
  }
}
