/**
 * Validation System Types
 * 
 * Type definitions for layout validation.
 */

import type { ComponentInstance } from '../state/slices/componentsSlice';

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Validation issue
 */
export interface ValidationIssue {
  id: string;
  componentId: string;
  rule: string;
  severity: ValidationSeverity;
  message: string;
  description?: string;
  canAutoFix: boolean;
  autoFixFn?: () => void;
  affectedComponents?: string[]; // For multi-component issues
}

/**
 * Validation rule interface
 */
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: ValidationSeverity;
  enabled: boolean;
  validate: (
    component: ComponentInstance,
    allComponents: Record<string, ComponentInstance>,
    viewport: { width: number; height: number }
  ) => ValidationIssue[];
}

/**
 * Validation result for a single component
 */
export interface ComponentValidationResult {
  componentId: string;
  issues: ValidationIssue[];
  hasErrors: boolean;
  hasWarnings: boolean;
}

/**
 * Overall validation result
 */
export interface ValidationResult {
  timestamp: number;
  components: ComponentValidationResult[];
  totalErrors: number;
  totalWarnings: number;
  totalIssues: number;
  isValid: boolean;
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  enabled: boolean;
  debounceMs: number;
  rules: {
    overlap: boolean;
    safeArea: boolean;
    touchTarget: boolean;
    offscreen: boolean;
  };
}
