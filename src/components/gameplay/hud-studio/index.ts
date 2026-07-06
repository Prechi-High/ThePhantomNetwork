/**
 * HUD Studio - Visual Editor for Gameplay HUD
 * 
 * Development-only tool for designing, configuring, and exporting HUD layouts.
 * This module is automatically stripped from production builds.
 * 
 * @module hud-studio
 */

// Core Components
export { HUDStudioProvider } from './HUDStudioProvider';
export { EditModeWrapper } from './core/EditModeWrapper';
export { EditableComponent } from './core/EditableComponent';

// Systems
export { componentRegistry } from './systems/registry/ComponentRegistry';
export { useStudioStore } from './systems/state/store';
export { commandHistory } from './systems/history/CommandHistory';

// Types
export type { HUDComponentMetadata, ComponentCategory, EditableProp } from './systems/registry/types';
export type { ComponentInstance, NormalizedPosition, NormalizedSize } from './systems/state/slices/componentsSlice';
export type { Command } from './systems/history/types';

// Utilities
export { pixelsToNormalized, normalizedToPixels } from './systems/layout/normalizer';
