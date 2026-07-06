/**
 * Default Component Configurations
 * 
 * Default properties and constraints for common HUD components.
 */

import type { ComponentConstraints, EditableProp } from './types';

export const DEFAULT_CONSTRAINTS: ComponentConstraints = {
  minWidth: 0.05,
  minHeight: 0.05,
  maxWidth: 1.0,
  maxHeight: 1.0,
  maintainAspectRatio: false,
  lockPosition: false,
  lockSize: false,
};

export const COMMON_EDITABLE_PROPS: EditableProp[] = [
  {
    key: 'opacity',
    label: 'Opacity',
    type: 'slider',
    defaultValue: 1.0,
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: 'scale',
    label: 'Scale',
    type: 'slider',
    defaultValue: 1.0,
    min: 0.5,
    max: 2.0,
    step: 0.1,
  },
];

export const DEFAULT_POSITIONS = {
  'top-hud': { x: 0.5, y: 0.05, width: 0.9, height: 0.15 },
  'wheel': { x: 0.5, y: 0.45, width: 0.65, height: 0.4 },
  'spin-button': { x: 0.5, y: 0.7, width: 0.35, height: 0.12 },
  'voice-widget': { x: 0.25, y: 0.8, width: 0.2, height: 0.08 },
  'recording-widget': { x: 0.75, y: 0.8, width: 0.2, height: 0.08 },
  'live-feed': { x: 0.1, y: 0.4, width: 0.18, height: 0.3 },
  'squad-panel': { x: 0.9, y: 0.4, width: 0.18, height: 0.3 },
  'active-effects': { x: 0.5, y: 0.85, width: 0.8, height: 0.06 },
  'skill-dock': { x: 0.5, y: 0.92, width: 0.9, height: 0.12 },
};
