/**
 * useValidation - Hook for layout validation
 * 
 * Provides validation state and control.
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useStudioStore } from '../systems/state/store';
import { validator } from '../systems/validation/Validator';
import type { ValidationResult } from '../systems/validation/types';

/**
 * Debounce delay for validation (ms)
 */
const VALIDATION_DEBOUNCE_MS = 500;

/**
 * useValidation hook provides validation functionality
 * 
 * Features:
 * - Auto-validates on component changes (debounced)
 * - Stores results in Zustand
 * - Provides manual validation trigger
 * - Auto-fix support
 */
export function useValidation() {
  const components = useStudioStore(state => state.components);
  const viewport = useStudioStore(state => state.viewport);
  const validationResult = useStudioStore(state => state.validationResult);
  const setValidationResult = useStudioStore(state => state.setValidationResult);
  const validationEnabled = useStudioStore(state => state.validationEnabled);

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Run validation
   */
  const validate = useCallback(() => {
    if (!validationEnabled) return;

    const result = validator.validateAll(components, {
      width: viewport.width,
      height: viewport.height,
    });

    setValidationResult(result);
  }, [components, viewport, validationEnabled, setValidationResult]);

  /**
   * Validate with debounce
   */
  const validateDebounced = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      validate();
    }, VALIDATION_DEBOUNCE_MS);
  }, [validate]);

  /**
   * Auto-fix all issues
   */
  const autoFixAll = useCallback(() => {
    if (!validationResult) return 0;

    const fixed = validator.autoFixAll(validationResult);
    
    // Re-validate after fixes
    setTimeout(() => validate(), 100);
    
    return fixed;
  }, [validationResult, validate]);

  /**
   * Auto-fix issues for specific component
   */
  const autoFixComponent = useCallback((componentId: string) => {
    if (!validationResult) return 0;

    const fixed = validator.autoFixComponent(componentId, validationResult);
    
    // Re-validate after fixes
    setTimeout(() => validate(), 100);
    
    return fixed;
  }, [validationResult, validate]);

  /**
   * Auto-validate on component changes
   */
  useEffect(() => {
    validateDebounced();

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [components, validateDebounced]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    validationResult,
    validate,
    autoFixAll,
    autoFixComponent,
    hasIssues: validationResult ? validationResult.totalIssues > 0 : false,
    hasErrors: validationResult ? validationResult.totalErrors > 0 : false,
    hasWarnings: validationResult ? validationResult.totalWarnings > 0 : false,
  };
}
