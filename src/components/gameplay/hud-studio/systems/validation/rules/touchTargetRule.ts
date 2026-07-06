/**
 * Touch Target Rule
 * 
 * Warns when interactive components are too small for touch interaction.
 */

import type { ComponentInstance } from '../../state/slices/componentsSlice';
import type { ValidationRule, ValidationIssue } from '../types';

/**
 * Minimum touch target size (normalized)
 * Based on WCAG 2.1 Level AAA (44x44 CSS pixels)
 * Assuming 390px viewport width: 44/390 ≈ 0.113
 */
const MIN_TOUCH_SIZE = {
  width: 0.113, // ~44px at 390px viewport
  height: 0.052, // ~44px at 844px viewport
};

/**
 * Interactive component types
 * (Placeholder - would be determined by component metadata)
 */
const INTERACTIVE_TYPES = [
  'button',
  'toggle',
  'slider',
  'input',
  'link',
];

/**
 * Check if component is likely interactive
 */
function isInteractive(component: ComponentInstance): boolean {
  // Check if component type suggests interactivity
  const componentType = component.componentId.toLowerCase();
  
  return INTERACTIVE_TYPES.some(type => 
    componentType.includes(type)
  );
}

/**
 * Check touch target size
 */
function checkTouchTargetSize(
  component: ComponentInstance
): {
  widthTooSmall: boolean;
  heightTooSmall: boolean;
  actualWidth: number;
  actualHeight: number;
} {
  return {
    widthTooSmall: component.size.width < MIN_TOUCH_SIZE.width,
    heightTooSmall: component.size.height < MIN_TOUCH_SIZE.height,
    actualWidth: component.size.width,
    actualHeight: component.size.height,
  };
}

export const touchTargetRule: ValidationRule = {
  id: 'touch-target',
  name: 'Touch Target Size',
  description: 'Validates minimum touch target size for accessibility',
  severity: 'warning',
  enabled: true,

  validate: (component, _allComponents, viewport) => {
    const issues: ValidationIssue[] = [];

    if (!component.visible) return issues;

    // Only check interactive components
    if (!isInteractive(component)) return issues;

    const check = checkTouchTargetSize(component);

    if (check.widthTooSmall || check.heightTooSmall) {
      const actualWidthPx = Math.round(check.actualWidth * viewport.width);
      const actualHeightPx = Math.round(check.actualHeight * viewport.height);

      const problems: string[] = [];
      if (check.widthTooSmall) problems.push(`width ${actualWidthPx}px`);
      if (check.heightTooSmall) problems.push(`height ${actualHeightPx}px`);

      issues.push({
        id: `touch-target-${component.id}`,
        componentId: component.id,
        rule: 'touch-target',
        severity: 'warning',
        message: 'Touch target too small',
        description: `Interactive component has ${problems.join(' and ')} below minimum 44px. This may cause usability issues.`,
        canAutoFix: true,
        autoFixFn: () => {
          // Auto-fix: Expand to minimum size
          const newSize = {
            width: Math.max(component.size.width, MIN_TOUCH_SIZE.width),
            height: Math.max(component.size.height, MIN_TOUCH_SIZE.height),
          };

          // TODO: Apply fix via store
          console.log('Auto-fix touch target:', component.id, newSize);
        },
      });
    }

    return issues;
  },
};
