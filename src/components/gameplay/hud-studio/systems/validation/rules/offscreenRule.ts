/**
 * Offscreen Rule
 * 
 * Warns when components are partially or fully offscreen.
 */

import type { ComponentInstance } from '../../state/slices/componentsSlice';
import type { ValidationRule, ValidationIssue } from '../types';

/**
 * Check if component is offscreen
 */
function checkOffscreen(
  component: ComponentInstance
): {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
  fullyOffscreen: boolean;
} {
  const { position, size } = component;
  const right = position.x + size.width;
  const bottom = position.y + size.height;

  const left = position.x < 0;
  const rightOff = right > 1;
  const top = position.y < 0;
  const bottomOff = bottom > 1;

  const fullyOffscreen =
    (position.x >= 1 || right <= 0) ||
    (position.y >= 1 || bottom <= 0);

  return {
    left,
    right: rightOff,
    top,
    bottom: bottomOff,
    fullyOffscreen,
  };
}

/**
 * Calculate offscreen percentage
 */
function calculateOffscreenPercentage(
  component: ComponentInstance
): number {
  const { position, size } = component;

  // Calculate visible area
  const visibleLeft = Math.max(0, position.x);
  const visibleRight = Math.min(1, position.x + size.width);
  const visibleTop = Math.max(0, position.y);
  const visibleBottom = Math.min(1, position.y + size.height);

  const visibleWidth = Math.max(0, visibleRight - visibleLeft);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);
  const visibleArea = visibleWidth * visibleHeight;

  const totalArea = size.width * size.height;

  return ((totalArea - visibleArea) / totalArea) * 100;
}

export const offscreenRule: ValidationRule = {
  id: 'offscreen',
  name: 'Offscreen Component',
  description: 'Detects components outside viewport bounds',
  severity: 'error',
  enabled: true,

  validate: (component) => {
    const issues: ValidationIssue[] = [];

    if (!component.visible) return issues;

    const check = checkOffscreen(component);
    const hasIssue = Object.values(check).some(v => v);

    if (hasIssue) {
      const offscreenPercent = calculateOffscreenPercentage(component);

      const directions: string[] = [];
      if (check.left) directions.push('left');
      if (check.right) directions.push('right');
      if (check.top) directions.push('top');
      if (check.bottom) directions.push('bottom');

      const severity = check.fullyOffscreen ? 'error' : 'warning';

      issues.push({
        id: `offscreen-${component.id}`,
        componentId: component.id,
        rule: 'offscreen',
        severity,
        message: check.fullyOffscreen
          ? 'Component fully offscreen'
          : 'Component partially offscreen',
        description: check.fullyOffscreen
          ? 'Component is completely outside viewport bounds and will not be visible.'
          : `Component extends ${directions.join(', ')} outside viewport (${offscreenPercent.toFixed(0)}% offscreen).`,
        canAutoFix: true,
        autoFixFn: () => {
          // Auto-fix: Clamp to viewport bounds
          const newPosition = {
            x: Math.max(0, Math.min(1 - component.size.width, component.position.x)),
            y: Math.max(0, Math.min(1 - component.size.height, component.position.y)),
          };

          // TODO: Apply fix via store
          console.log('Auto-fix offscreen:', component.id, newPosition);
        },
      });
    }

    return issues;
  },
};
