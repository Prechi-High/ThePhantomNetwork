# HUD Studio - Usage Guide

## Phase 2: Core Editing - COMPLETE ✅

Phase 2 implementation is now complete! You can now visually select, drag, and resize HUD components.

## What's Working

✅ **EditableComponent wrapper** - Wraps HUD components to make them editable  
✅ **Selection system** - Click to select components, visual feedback  
✅ **Drag & drop** - Drag components with mouse or touch (GPU-accelerated)  
✅ **Resize system** - 8 resize handles (corners + midpoints)  
✅ **Keyboard shortcuts** - Arrow keys to nudge, Delete to remove, Escape to deselect  
✅ **History integration** - Undo/redo support for move and resize operations  
✅ **Visual feedback** - Selection outline with purple glow, component info label  
✅ **Constraints** - Canvas boundary clamping, min/max size enforcement  
✅ **Locked components** - Respects locked state (no drag/resize)  

## Quick Start

### 1. Wrap Your GameplayHUD

```typescript
// src/app/(player)/play/[sessionId]/page.tsx

import { HUDStudioProvider } from '@/components/gameplay/hud-studio';

export default function PlayPage() {
  return (
    <HUDStudioProvider>
      <GameplayHUD {...props} />
    </HUDStudioProvider>
  );
}
```

### 2. Wrap Individual HUD Components

```typescript
// src/components/gameplay/hud/YourComponent.tsx

import { EditableComponent } from '@/components/gameplay/hud-studio';

export function MyHUDComponent() {
  return (
    <EditableComponent instanceId="my-component">
      <div>Your component content</div>
    </EditableComponent>
  );
}
```

### 3. Register Components (Optional but Recommended)

```typescript
// src/components/gameplay/hud/MyComponent.tsx

import { componentRegistry } from '@/components/gameplay/hud-studio';

if (process.env.NODE_ENV === 'development') {
  componentRegistry.register({
    id: 'my-component',
    displayName: 'My Component',
    category: 'core-hud',
    component: MyHUDComponent,
    defaultProps: {},
    editableProps: [],
    constraints: {
      minWidth: 0.1,
      minHeight: 0.05,
    },
  });
}
```

### 4. Initialize Component State

You need to add initial component instances to the Zustand store:

```typescript
// In your setup code or EditModeWrapper

import { useStudioStore } from '@/components/gameplay/hud-studio';

const addComponent = useStudioStore(state => state.addComponent);

// Add a component
addComponent({
  id: 'my-component-1',
  componentId: 'my-component',
  position: { x: 0.1, y: 0.1 },
  size: { width: 0.3, height: 0.2 },
  zIndex: 1,
  visible: true,
  locked: false,
  opacity: 1,
  props: {},
  styleOverrides: {},
});
```

## Keyboard Shortcuts

- **Cmd/Ctrl + E** - Toggle edit mode
- **Click** - Select component
- **Escape** - Deselect
- **Delete/Backspace** - Remove selected component
- **Arrow Keys** - Nudge position (1px)
- **Shift + Arrow Keys** - Nudge position (10px)
- **Cmd/Ctrl + Z** - Undo
- **Cmd/Ctrl + Shift + Z** - Redo

## Mouse Controls

- **Click** - Select component
- **Drag** - Move component
- **Drag handles** - Resize component
- **Shift + Drag corner** - Maintain aspect ratio (TODO)
- **Alt + Drag** - Resize from center (TODO)

## Current Limitations

### Not Yet Implemented (Phase 3+):

- ❌ Property Inspector UI (can only move/resize, can't edit properties via UI)
- ❌ Layers Panel (no visual layer management)
- ❌ Component Library (can't add new components from UI)
- ❌ Toolbar (no alignment/snap controls in UI)
- ❌ Snap system (grid/component snapping)
- ❌ Validation panel (no warnings for overlaps, safe areas)
- ❌ Layout save/load/export UI
- ❌ Device preview switcher
- ❌ Live data toggle

### Known Issues:

- Component state must be manually initialized (no automatic detection yet)
- No visual grid or guides yet
- Snap to grid is not implemented yet
- Aspect ratio constraint (Shift key) needs refinement

## Architecture

### Component Flow

```
HUDStudioProvider (dev-only wrapper)
  └── EditModeWrapper (toggle button)
      └── Your HUD Components
          └── EditableComponent (wrapper per component)
              ├── Children (actual HUD content)
              └── SelectionOverlay (when selected)
                  ├── Selection outline
                  ├── Component label
                  └── 8 resize handles
```

### State Management

All editor state is in Zustand store:
- `isEditMode` - Edit mode on/off
- `selectedComponentId` - Currently selected component
- `components` - Map of all editable component instances
- `viewport` - Canvas size for coordinate conversion
- `editorSettings` - Snap, grid, and other settings

### Position System

All positions are **normalized (0.0 - 1.0)** for responsive layouts:
- `{ x: 0.5, y: 0.5 }` = center of canvas
- `{ width: 0.3, height: 0.2 }` = 30% width, 20% height
- Automatically converts to pixels based on viewport size

## Next Steps

### To Use HUD Studio Right Now:

1. Wrap your GameplayHUD with HUDStudioProvider
2. Wrap individual components with EditableComponent
3. Initialize component state in the store
4. Press Cmd/Ctrl+E to enter edit mode
5. Click, drag, and resize components!

### To Continue Development (Phase 3):

Run the implementation tasks for Phase 3:
- Task 3.1: Property Inspector Panel
- Task 3.2: Layers Panel
- Task 3.3: Component Library Panel
- Task 3.4: Toolbar

---

**Status**: Phase 2 Complete (4/4 tasks done)  
**Next Phase**: Phase 3 - UI Panels  
**Version**: 1.0.0-phase2  
**Last Updated**: 2025-01-XX
