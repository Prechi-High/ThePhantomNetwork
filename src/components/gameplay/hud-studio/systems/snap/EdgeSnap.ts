/**
 * EdgeSnap - Component edge snapping
 * 
 * Provides snapping to edges and centers of other components.
 */

import type { ComponentInstance, NormalizedPosition } from '../state/slices/componentsSlice';
import type { SnapTarget, SnapCandidate, BoundingBox } from './types';

export class EdgeSnap {
  /**
   * Get bounding box for a component
   */
  private static getBoundingBox(component: ComponentInstance): BoundingBox {
    const { position, size } = component;
    
    return {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      left: position.x,
      right: position.x + size.width,
      top: position.y,
      bottom: position.y + size.height,
      centerX: position.x + size.width / 2,
      centerY: position.y + size.height / 2,
    };
  }

  /**
   * Get snap candidates from all components
   * 
   * @param components - All component instances
   * @param excludeId - Component ID to exclude (the one being dragged)
   * @returns Array of snap candidates
   */
  static getSnapCandidates(
    components: Record<string, ComponentInstance>,
    excludeId: string
  ): SnapCandidate[] {
    const candidates: SnapCandidate[] = [];

    Object.values(components).forEach(component => {
      if (component.id === excludeId || !component.visible) return;

      const box = this.getBoundingBox(component);
      
      candidates.push({
        componentId: component.id,
        edges: {
          left: box.left,
          right: box.right,
          top: box.top,
          bottom: box.bottom,
          centerX: box.centerX,
          centerY: box.centerY,
        },
      });
    });

    return candidates;
  }

  /**
   * Get edge snap targets for a position
   * 
   * @param position - Current position
   * @param size - Component size
   * @param candidates - Snap candidates from other components
   * @returns Snap targets for X and Y axes
   */
  static getEdgeSnapTargets(
    position: NormalizedPosition,
    size: { width: number; height: number },
    candidates: SnapCandidate[]
  ): { x: SnapTarget[]; y: SnapTarget[] } {
    const xTargets: SnapTarget[] = [];
    const yTargets: SnapTarget[] = [];

    const draggedBox: BoundingBox = {
      x: position.x,
      y: position.y,
      width: size.width,
      height: size.height,
      left: position.x,
      right: position.x + size.width,
      top: position.y,
      bottom: position.y + size.height,
      centerX: position.x + size.width / 2,
      centerY: position.y + size.height / 2,
    };

    candidates.forEach(candidate => {
      const { edges, componentId } = candidate;

      // X-axis snap targets (left, right, centerX)
      xTargets.push(
        // Align left edges
        {
          position: edges.left,
          type: 'component-edge',
          componentId,
          label: 'Left',
        },
        // Align right edge to other's right
        {
          position: edges.right - draggedBox.width,
          type: 'component-edge',
          componentId,
          label: 'Right',
        },
        // Align left to other's right (side by side)
        {
          position: edges.right,
          type: 'component-edge',
          componentId,
          label: 'Right edge',
        },
        // Align right to other's left (side by side)
        {
          position: edges.left - draggedBox.width,
          type: 'component-edge',
          componentId,
          label: 'Left edge',
        },
        // Align centers
        {
          position: edges.centerX - draggedBox.width / 2,
          type: 'component-center',
          componentId,
          label: 'Center X',
        }
      );

      // Y-axis snap targets (top, bottom, centerY)
      yTargets.push(
        // Align top edges
        {
          position: edges.top,
          type: 'component-edge',
          componentId,
          label: 'Top',
        },
        // Align bottom edge to other's bottom
        {
          position: edges.bottom - draggedBox.height,
          type: 'component-edge',
          componentId,
          label: 'Bottom',
        },
        // Align top to other's bottom (stacked)
        {
          position: edges.bottom,
          type: 'component-edge',
          componentId,
          label: 'Bottom edge',
        },
        // Align bottom to other's top (stacked)
        {
          position: edges.top - draggedBox.height,
          type: 'component-edge',
          componentId,
          label: 'Top edge',
        },
        // Align centers
        {
          position: edges.centerY - draggedBox.height / 2,
          type: 'component-center',
          componentId,
          label: 'Center Y',
        }
      );
    });

    return { x: xTargets, y: yTargets };
  }

  /**
   * Snap a position to component edges
   * 
   * @param position - Current position
   * @param size - Component size
   * @param candidates - Snap candidates
   * @param threshold - Snap threshold (normalized)
   * @returns Snapped position or original if no snap
   */
  static snapToEdges(
    position: NormalizedPosition,
    size: { width: number; height: number },
    candidates: SnapCandidate[],
    threshold: number
  ): NormalizedPosition {
    const targets = this.getEdgeSnapTargets(position, size, candidates);

    let snappedX = position.x;
    let snappedY = position.y;
    let minDistanceX = threshold;
    let minDistanceY = threshold;

    // Find closest X snap target
    targets.x.forEach(target => {
      const distance = Math.abs(position.x - target.position);
      if (distance < minDistanceX) {
        minDistanceX = distance;
        snappedX = target.position;
      }
    });

    // Find closest Y snap target
    targets.y.forEach(target => {
      const distance = Math.abs(position.y - target.position);
      if (distance < minDistanceY) {
        minDistanceY = distance;
        snappedY = target.position;
      }
    });

    return {
      x: snappedX,
      y: snappedY,
    };
  }
}
