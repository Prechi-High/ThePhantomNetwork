/**
 * Validation Slice
 * 
 * Manages validation results and issues.
 */

import type { StateCreator } from 'zustand';
import type { ValidationResult } from '../../validation/types';

export interface ValidationSlice {
  validationResult: ValidationResult | null;
  validationEnabled: boolean;
  setValidationResult: (result: ValidationResult | null) => void;
  setValidationEnabled: (enabled: boolean) => void;
}

export const validationSlice: StateCreator<ValidationSlice> = (set) => ({
  validationResult: null,
  validationEnabled: true,

  setValidationResult: (result) => set({ validationResult: result }),
  setValidationEnabled: (enabled) => set({ validationEnabled: enabled }),
});
