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
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: any }>;
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
  props: Record<string, any>;
}

export interface HUDComponentMetadata {
  id: string;
  displayName: string;
  category: ComponentCategory;
  component: ComponentType<any>;
  defaultProps: Record<string, any>;
  editableProps: EditableProp[];
  constraints: ComponentConstraints;
  states?: ComponentState[];
  icon?: string;
}
