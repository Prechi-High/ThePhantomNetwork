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
export { SelectionOverlay } from './core/SelectionOverlay';

// Panels
export { PropertyInspector } from './panels/PropertyInspector';
export { LayersPanel } from './panels/LayersPanel';
export { ComponentLibrary } from './panels/ComponentLibrary';
export { Toolbar } from './panels/Toolbar';

// Systems
export { componentRegistry } from './systems/registry/ComponentRegistry';
export { useStudioStore } from './systems/state/store';
export { commandHistory } from './systems/history/CommandHistory';

// Types
export type { HUDComponentMetadata, ComponentCategory, EditableProp } from './systems/registry/types';
export type { ComponentInstance, NormalizedPosition, NormalizedSize } from './systems/state/slices/componentsSlice';
export type { Command } from './systems/history/types';

// Hooks
export { useSelection } from './hooks/useSelection';
export { useDragDrop } from './hooks/useDragDrop';
export { useResize } from './hooks/useResize';

// Utilities
export { pixelsToNormalized, normalizedToPixels } from './systems/layout/normalizer';
