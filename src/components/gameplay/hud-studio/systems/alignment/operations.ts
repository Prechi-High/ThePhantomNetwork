/**
 * Alignment Operations
 * 
 * Core alignment and distribution logic.
 */

import type {
  ComponentBounds,
  AlignmentResult,
  AlignmentType,
  DistributionType,
  SizeMatchType,
} from './types';
import type { ComponentInstance, NormalizedPosition, NormalizedSize } from '../state/slices/componentsSlice';

/**
 * Calculate bounds for a component
 */
export function calculateBounds(component: ComponentInstance): ComponentBounds {
  const { position, size, id } = component;

  return {
    id,
    position,
    size,
    left: position.x,
    right: position.x + size.width,
    top: position.y,
    bottom: position.y + size.height,
    centerX: position.x + size.width / 2,
    centerY: position.y + size.height / 2,
  };
}

/**
 * Align components based on alignment type
 * 
 * @param components - Components to align
 * @param alignType - Type of alignment
 * @returns Alignment results for each component
 */
export function alignComponents(
  components: ComponentInstance[],
  alignType: AlignmentType
): AlignmentResult[] {
  if (components.length === 0) return [];

  const bounds = components.map(calculateBounds);

  switch (alignType) {
    case 'left':
      return alignLeft(bounds);
    case 'right':
      return alignRight(bounds);
    case 'top':
      return alignTop(bounds);
    case 'bottom':
      return alignBottom(bounds);
    case 'center-horizontal':
      return alignCenterHorizontal(bounds);
    case 'center-vertical':
      return alignCenterVertical(bounds);
    case 'center-both':
      return alignCenterBoth(bounds);
    default:
      return [];
  }
}

/**
 * Align to leftmost edge
 */
function alignLeft(bounds: ComponentBounds[]): AlignmentResult[] {
  const minLeft = Math.min(...bounds.map(b => b.left));

  return bounds.map(b => ({
    componentId: b.id,
    position: {
      x: minLeft,
      y: b.position.y,
    },
  }));
}

/**
 * Align to rightmost edge
 */
function alignRight(bounds: ComponentBounds[]): AlignmentResult[] {
  const maxRight = Math.max(...bounds.map(b => b.right));

  return bounds.map(b => ({
    componentId: b.id,
    position: {
      x: maxRight - b.size.width,
      y: b.position.y,
    },
  }));
}

/**
 * Align to topmost edge
 */
function alignTop(bounds: ComponentBounds[]): AlignmentResult[] {
  const minTop = Math.min(...bounds.map(b => b.top));

  return bounds.map(b => ({
    componentId: b.id,
    position: {
      x: b.position.x,
      y: minTop,
    },
  }));
}

/**
 * Align to bottommost edge
 */
function alignBottom(bounds: ComponentBounds[]): AlignmentResult[] {
  const maxBottom = Math.max(...bounds.map(b => b.bottom));

  return bounds.map(b => ({
    componentId: b.id,
    position: {
      x: b.position.x,
      y: maxBottom - b.size.height,
    },
  }));
}

/**
 * Align to horizontal center
 */
function alignCenterHorizontal(bounds: ComponentBounds[]): AlignmentResult[] {
  // Calculate average center X
  const avgCenterX = bounds.reduce((sum, b) => sum + b.centerX, 0) / bounds.length;

  return bounds.map(b => ({
    componentId: b.id,
    position: {
      x: avgCenterX - b.size.width / 2,
      y: b.position.y,
    },
  }));
}

/**
 * Align to vertical center
 */
function alignCenterVertical(bounds: ComponentBounds[]): AlignmentResult[] {
  // Calculate average center Y
  const avgCenterY = bounds.reduce((sum, b) => sum + b.centerY, 0) / bounds.length;

  return bounds.map(b => ({
    componentId: b.id,
    position: {
      x: b.position.x,
      y: avgCenterY - b.size.height / 2,
    },
  }));
}

/**
 * Align to both horizontal and vertical center
 */
function alignCenterBoth(bounds: ComponentBounds[]): AlignmentResult[] {
  const avgCenterX = bounds.reduce((sum, b) => sum + b.centerX, 0) / bounds.length;
  const avgCenterY = bounds.reduce((sum, b) => sum + b.centerY, 0) / bounds.length;

  return bounds.map(b => ({
    componentId: b.id,
    position: {
      x: avgCenterX - b.size.width / 2,
      y: avgCenterY - b.size.height / 2,
    },
  }));
}

/**
 * Distribute components evenly
 * 
 * @param components - Components to distribute
 * @param distributionType - Horizontal or vertical
 * @returns Alignment results for each component
 */
export function distributeComponents(
  components: ComponentInstance[],
  distributionType: DistributionType
): AlignmentResult[] {
  if (components.length < 3) {
    // Need at least 3 components to distribute
    return [];
  }

  const bounds = components.map(calculateBounds);

  if (distributionType === 'horizontal') {
    return distributeHorizontal(bounds);
  } else {
    return distributeVertical(bounds);
  }
}

/**
 * Distribute horizontally with equal spacing
 */
function distributeHorizontal(bounds: ComponentBounds[]): AlignmentResult[] {
  // Sort by left edge
  const sorted = [...bounds].sort((a, b) => a.left - b.left);

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Calculate total width of all components
  const totalWidth = sorted.reduce((sum, b) => sum + b.size.width, 0);

  // Calculate available space for gaps
  const availableSpace = last.right - first.left - totalWidth;

  // Calculate gap size
  const gapSize = availableSpace / (sorted.length - 1);

  // Position each component
  let currentX = first.left;

  return sorted.map((b, index) => {
    const position: NormalizedPosition = {
      x: index === 0 ? b.position.x : currentX,
      y: b.position.y,
    };

    currentX += b.size.width + gapSize;

    return {
      componentId: b.id,
      position,
    };
  });
}

/**
 * Distribute vertically with equal spacing
 */
function distributeVertical(bounds: ComponentBounds[]): AlignmentResult[] {
  // Sort by top edge
  const sorted = [...bounds].sort((a, b) => a.top - b.top);

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Calculate total height of all components
  const totalHeight = sorted.reduce((sum, b) => sum + b.size.height, 0);

  // Calculate available space for gaps
  const availableSpace = last.bottom - first.top - totalHeight;

  // Calculate gap size
  const gapSize = availableSpace / (sorted.length - 1);

  // Position each component
  let currentY = first.top;

  return sorted.map((b, index) => {
    const position: NormalizedPosition = {
      x: b.position.x,
      y: index === 0 ? b.position.y : currentY,
    };

    currentY += b.size.height + gapSize;

    return {
      componentId: b.id,
      position,
    };
  });
}

/**
 * Match size of components
 * 
 * @param components - Components to match
 * @param matchType - Width, height, or both
 * @param referenceComponent - Component to match (first if not specified)
 * @returns Alignment results with new sizes
 */
export function matchSize(
  components: ComponentInstance[],
  matchType: SizeMatchType,
  referenceComponent?: ComponentInstance
): AlignmentResult[] {
  if (components.length === 0) return [];

  const reference = referenceComponent || components[0];

  return components.map(component => {
    const newSize: NormalizedSize = { ...component.size };

    if (matchType === 'width' || matchType === 'both') {
      newSize.width = reference.size.width;
    }

    if (matchType === 'height' || matchType === 'both') {
      newSize.height = reference.size.height;
    }

    return {
      componentId: component.id,
      position: component.position,
      size: newSize,
    };
  });
}

/**
 * Get bounding box of multiple components
 */
export function getGroupBounds(components: ComponentInstance[]): {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
} {
  if (components.length === 0) {
    return {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0,
    };
  }

  const bounds = components.map(calculateBounds);

  const left = Math.min(...bounds.map(b => b.left));
  const right = Math.max(...bounds.map(b => b.right));
  const top = Math.min(...bounds.map(b => b.top));
  const bottom = Math.max(...bounds.map(b => b.bottom));

  return {
    left,
    right,
    top,
    bottom,
    width: right - left,
    height: bottom - top,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
  };
}
