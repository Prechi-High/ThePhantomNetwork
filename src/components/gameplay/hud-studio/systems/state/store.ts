/**
 * HUD Studio Store
 * 
 * Main Zustand store combining all slices with persistence middleware.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { editorSlice, type EditorSlice } from './slices/editorSlice';
import { componentsSlice, type ComponentsSlice } from './slices/componentsSlice';
import { historySlice, type HistorySlice } from './slices/historySlice';
import { layoutSlice, type LayoutSlice } from './slices/layoutSlice';
import { validationSlice, type ValidationSlice } from './slices/validationSlice';

export type StudioStore = EditorSlice &
  ComponentsSlice &
  HistorySlice &
  LayoutSlice &
  ValidationSlice;

export const useStudioStore = create<StudioStore>()(
  devtools(
    persist(
      (...args) => ({
        ...editorSlice(...args),
        ...componentsSlice(...args),
        ...historySlice(...args),
        ...layoutSlice(...args),
        ...validationSlice(...args),
      }),
      {
        name: 'hud-studio-storage',
        partialize: (state) => ({
          // Only persist these fields
          layouts: state.layouts,
          currentLayoutId: state.currentLayoutId,
          editorSettings: state.editorSettings,
          viewport: state.viewport,
        }),
      }
    ),
    {
      name: 'HUD Studio',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);
