/**
 * History Slice
 * 
 * Manages undo/redo history state.
 */

import type { StateCreator } from 'zustand';

export interface HistorySlice {
  canUndo: boolean;
  canRedo: boolean;
  setHistoryState: (canUndo: boolean, canRedo: boolean) => void;
}

export const historySlice: StateCreator<HistorySlice> = (set) => ({
  canUndo: false,
  canRedo: false,
  setHistoryState: (canUndo, canRedo) => set({ canUndo, canRedo }),
});
