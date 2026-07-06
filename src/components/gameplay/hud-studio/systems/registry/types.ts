/**
 * Component Registry Type Definitions
 * 
 * Defines the structure for registering HUD components with the visual editor.
 */

import type { ComponentType } from 'react';

export type ComponentCategory =
  | 'core-hud'
  | 'gameplay'
  | 'combat'
  | 'social'
  | 'voice'
  | 'economy'
  | 'progression'
  | 'effects'
  | 'developer';

export type PropType =
  | 'number'
  | 'string'
  | 'boolean'
  | 'color'
  | 'select'
  | 'slider'
  | 'range';

export interface EditableProp {
  key: string;
  label: string;
  type: PropType;
  defaultValue: unknown;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: unknown }>;
}

export interface ComponentConstraints {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  maintainAspectRatio?: boolean;
  lockPosition?: boolean;
  lockSize?: boolean;
}

export interface ComponentState {
  id: string;
  label: string;
  props: Record<string, unknown>;
}

export interface HUDComponentMetadata {
  id: string;
  displayName: string;
  category: ComponentCategory;
  component: ComponentType<Record<string, unknown>>;
  defaultProps: Record<string, unknown>;
  editableProps: EditableProp[];
  constraints: ComponentConstraints;
  states?: ComponentState[];
  icon?: string;
}
