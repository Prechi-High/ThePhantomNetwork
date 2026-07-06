/**
 * Validation Rules Export
 * 
 * Central export for all validation rules.
 */

export { overlapRule } from './overlapRule';
export { safeAreaRule } from './safeAreaRule';
export { touchTargetRule } from './touchTargetRule';
export { offscreenRule } from './offscreenRule';

import { overlapRule } from './overlapRule';
import { safeAreaRule } from './safeAreaRule';
import { touchTargetRule } from './touchTargetRule';
import { offscreenRule } from './offscreenRule';

/**
 * All validation rules
 */
export const ALL_RULES = [
  overlapRule,
  safeAreaRule,
  touchTargetRule,
  offscreenRule,
];

/**
 * Default enabled rules
 */
export const DEFAULT_RULES = ALL_RULES.filter(rule => rule.enabled);
