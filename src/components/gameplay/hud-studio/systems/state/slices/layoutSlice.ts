/**
 * Layout Slice
 * 
 * Manages saved layouts and current layout state.
 */

import type { StateCreator } from 'zustand';

export interface LayoutMetadata {
  id: string;
  name: string;
  timestamp: string;
  viewport: { width: number; height: number };
  isFavorite?: boolean;
}

export interface LayoutSlice {
  layouts: LayoutMetadata[];
  currentLayoutId: string | null;
  setLayouts: (layouts: LayoutMetadata[]) => void;
  setCurrentLayout: (id: string | null) => void;
  addLayout: (layout: LayoutMetadata) => void;
  removeLayout: (id: string) => void;
  updateLayout: (id: string, updates: Partial<LayoutMetadata>) => void;
}

export const layoutSlice: StateCreator<LayoutSlice> = (set) => ({
  layouts: [],
  currentLayoutId: null,

  setLayouts: (layouts) => set({ layouts }),
  setCurrentLayout: (id) => set({ currentLayoutId: id }),

  addLayout: (layout) =>
    set((state) => ({
      layouts: [...state.layouts, layout],
    })),

  removeLayout: (id) =>
    set((state) => ({
      layouts: state.layouts.filter((l) => l.id !== id),
      currentLayoutId: state.currentLayoutId === id ? null : state.currentLayoutId,
    })),

  updateLayout: (id, updates) =>
    set((state) => ({
      layouts: state.layouts.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),
});
