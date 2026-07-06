/**
 * Components Slice
 * 
 * Manages all HUD component instances, their positions, sizes, and properties.
 */

import type { StateCreator } from 'zustand';

export interface NormalizedPosition {
  x: number; // 0.0 - 1.0
  y: number; // 0.0 - 1.0
}

export interface NormalizedSize {
  width: number; // 0.0 - 1.0
  height: number; // 0.0 - 1.0
}

export interface StyleOverrides {
  borderRadius?: number;
  blur?: number;
  borderWidth?: number;
  borderColor?: string;
  shadow?: 'none' | 'small' | 'medium' | 'large';
  padding?: { horizontal: number; vertical: number };
  margin?: { horizontal: number; vertical: number };
  scale?: number;
}

export interface ComponentInstance {
  id: string;
  componentId: string;
  position: NormalizedPosition;
  size: NormalizedSize;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  opacity: number;
  props: Record<string, unknown>;
  styleOverrides: StyleOverrides;
}

export interface ComponentsSlice {
  components: Record<string, ComponentInstance>;
  addComponent: (component: ComponentInstance) => void;
  removeComponent: (id: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void;
  duplicateComponent: (id: string) => void;
  reorderComponent: (id: string, newZIndex: number) => void;
}

export const componentsSlice: StateCreator<ComponentsSlice> = (set) => ({
  components: {},

  addComponent: (component) =>
    set((state) => ({
      components: { ...state.components, [component.id]: component },
    })),

  removeComponent: (id) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _removed, ...rest } = state.components;
      return { components: rest };
    }),

  updateComponent: (id, updates) =>
    set((state) => ({
      components: {
        ...state.components,
        [id]: { ...state.components[id], ...updates },
      },
    })),

  duplicateComponent: (id) =>
    set((state) => {
      const original = state.components[id];
      if (!original) return state;

      const newId = `${original.componentId}-${Date.now()}`;
      const duplicate: ComponentInstance = {
        ...original,
        id: newId,
        position: {
          x: Math.min(original.position.x + 0.02, 0.98),
          y: Math.min(original.position.y + 0.02, 0.98),
        },
      };

      return {
        components: { ...state.components, [newId]: duplicate },
      };
    }),

  reorderComponent: (id, newZIndex) =>
    set((state) => {
      const component = state.components[id];
      if (!component) return state;

      return {
        components: {
          ...state.components,
          [id]: { ...component, zIndex: newZIndex },
        },
      };
    }),
});
