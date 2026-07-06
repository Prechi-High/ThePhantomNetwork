/**
 * Editor Slice
 * 
 * Manages editor state: edit mode, selection, viewport, panels, and settings.
 */

import type { StateCreator } from 'zustand';

export interface ViewportConfig {
  width: number;
  height: number;
  scale: number;
  deviceName: string;
}

export interface EditorSettings {
  snapEnabled: boolean;
  snapToGrid: boolean;
  snapToComponents: boolean;
  snapToSafeArea: boolean;
  gridSize: number;
  showSafeAreas: boolean;
  showGrid: boolean;
  showRulers: boolean;
  dataMode: 'mock' | 'live';
}

export interface EditorSlice {
  // Mode
  isEditMode: boolean;
  toggleEditMode: () => void;
  setEditMode: (enabled: boolean) => void;

  // Selection
  selectedComponentId: string | null;
  selectComponent: (id: string | null) => void;

  // Viewport
  viewport: ViewportConfig;
  setViewport: (viewport: ViewportConfig) => void;

  // Panels
  panels: {
    inspector: boolean;
    layers: boolean;
    library: boolean;
    validation: boolean;
  };
  togglePanel: (panel: keyof EditorSlice['panels']) => void;

  // Settings
  editorSettings: EditorSettings;
  updateSettings: (settings: Partial<EditorSettings>) => void;
}

export const editorSlice: StateCreator<EditorSlice> = (set) => ({
  isEditMode: false,
  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
  setEditMode: (enabled) => set({ isEditMode: enabled }),

  selectedComponentId: null,
  selectComponent: (id) => set({ selectedComponentId: id }),

  viewport: {
    width: 390,
    height: 844,
    scale: 1,
    deviceName: 'iPhone 16',
  },
  setViewport: (viewport) => set({ viewport }),

  panels: {
    inspector: true,
    layers: true,
    library: false,
    validation: false,
  },
  togglePanel: (panel) =>
    set((state) => ({
      panels: { ...state.panels, [panel]: !state.panels[panel] },
    })),

  editorSettings: {
    snapEnabled: true,
    snapToGrid: true,
    snapToComponents: true,
    snapToSafeArea: true,
    gridSize: 8,
    showSafeAreas: false,
    showGrid: false,
    showRulers: false,
    dataMode: 'mock',
  },
  updateSettings: (settings) =>
    set((state) => ({
      editorSettings: { ...state.editorSettings, ...settings },
    })),
});
