/**
 * Safe Area Rule
 * 
 * Warns when components are placed in device safe areas (notch, status bar, etc.).
 */

import type { ComponentInstance } from '../../state/slices/componentsSlice';
import type { ValidationRule, ValidationIssue } from '../types';

/**
 * Device safe areas (normalized coordinates)
 * These are approximations for common devices
 */
const SAFE_AREAS = {
  top: 0.05, // Status bar / notch
  bottom: 0.03, // Home indicator
  left: 0.02, // Edge margins
  right: 0.02, // Edge margins
};

/**
 * Check if component intersects with safe area
 */
function checkSafeArea(
  component: ComponentInstance
): {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
} {
  const { position, size } = component;

  return {
    top: position.y < SAFE_AREAS.top,
    bottom: position.y + size.height > 1 - SAFE_AREAS.bottom,
    left: position.x < SAFE_AREAS.left,
    right: position.x + size.width > 1 - SAFE_AREAS.right,
  };
}

export const safeAreaRule: ValidationRule = {
  id: 'safe-area',
  name: 'Safe Area',
  description: 'Warns when components are in unsafe areas',
  severity: 'info',
  enabled: true,

  validate: (component) => {
    const issues: ValidationIssue[] = [];

    if (!component.visible) return issues;

    const violations = checkSafeArea(component);
    const hasViolation = Object.values(violations).some(v => v);

    if (hasViolation) {
      const areas: string[] = [];
      if (violations.top) areas.push('top (notch/status bar)');
      if (violations.bottom) areas.push('bottom (home indicator)');
      if (violations.left) areas.push('left edge');
      if (violations.right) areas.push('right edge');

      issues.push({
        id: `safe-area-${component.id}`,
        componentId: component.id,
        rule: 'safe-area',
        severity: 'info',
        message: 'Component in unsafe area',
        description: `Component extends into unsafe areas: ${areas.join(', ')}. May be obscured on some devices.`,
        canAutoFix: false,
      });
    }

    return issues;
  },
};
