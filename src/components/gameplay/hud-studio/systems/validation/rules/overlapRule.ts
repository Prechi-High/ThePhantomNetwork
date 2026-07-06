/**
 * Overlap Rule
 * 
 * Detects overlapping components.
 */

import type { ComponentInstance } from '../../state/slices/componentsSlice';
import type { ValidationRule, ValidationIssue } from '../types';

/**
 * Check if two components overlap
 */
function checkOverlap(
  a: ComponentInstance,
  b: ComponentInstance
): boolean {
  const aLeft = a.position.x;
  const aRight = a.position.x + a.size.width;
  const aTop = a.position.y;
  const aBottom = a.position.y + a.size.height;

  const bLeft = b.position.x;
  const bRight = b.position.x + b.size.width;
  const bTop = b.position.y;
  const bBottom = b.position.y + b.size.height;

  // Check if rectangles overlap
  return !(
    aRight <= bLeft ||
    aLeft >= bRight ||
    aBottom <= bTop ||
    aTop >= bBottom
  );
}

/**
 * Calculate overlap area (normalized)
 */
function calculateOverlapArea(
  a: ComponentInstance,
  b: ComponentInstance
): number {
  const overlapLeft = Math.max(a.position.x, b.position.x);
  const overlapRight = Math.min(
    a.position.x + a.size.width,
    b.position.x + b.size.width
  );
  const overlapTop = Math.max(a.position.y, b.position.y);
  const overlapBottom = Math.min(
    a.position.y + a.size.height,
    b.position.y + b.size.height
  );

  const width = overlapRight - overlapLeft;
  const height = overlapBottom - overlapTop;

  return width * height;
}

export const overlapRule: ValidationRule = {
  id: 'overlap',
  name: 'Component Overlap',
  description: 'Warns when components overlap',
  severity: 'warning',
  enabled: true,

  validate: (component, allComponents) => {
    const issues: ValidationIssue[] = [];

    if (!component.visible) return issues;

    // Check overlap with all other visible components
    Object.values(allComponents).forEach(other => {
      if (
        other.id === component.id ||
        !other.visible ||
        other.zIndex < component.zIndex // Only check higher z-index overlaps
      ) {
        return;
      }

      if (checkOverlap(component, other)) {
        const overlapArea = calculateOverlapArea(component, other);
        const overlapPercent = (overlapArea / (component.size.width * component.size.height)) * 100;

        issues.push({
          id: `overlap-${component.id}-${other.id}`,
          componentId: component.id,
          rule: 'overlap',
          severity: overlapPercent > 50 ? 'warning' : 'info',
          message: `Overlaps with "${other.componentId}"`,
          description: `Components overlap by ${overlapPercent.toFixed(0)}%. Consider adjusting positions or z-index.`,
          canAutoFix: false,
          affectedComponents: [component.id, other.id],
        });
      }
    });

    return issues;
  },
};
