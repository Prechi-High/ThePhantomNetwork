/**
 * Validation Slice
 * 
 * Manages validation results and issues.
 */

import type { StateCreator } from 'zustand';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  componentId: string | null;
  severity: ValidationSeverity;
  message: string;
  rule: string;
  autoFixable: boolean;
}

export interface ValidationSlice {
  issues: ValidationIssue[];
  setIssues: (issues: ValidationIssue[]) => void;
  clearIssues: () => void;
  removeIssue: (id: string) => void;
}

export const validationSlice: StateCreator<ValidationSlice> = (set) => ({
  issues: [],

  setIssues: (issues) => set({ issues }),
  clearIssues: () => set({ issues: [] }),
  removeIssue: (id) =>
    set((state) => ({
      issues: state.issues.filter((issue) => issue.id !== id),
    })),
});
