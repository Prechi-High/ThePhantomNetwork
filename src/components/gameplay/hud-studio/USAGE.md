# HUD Studio - Usage Guide

## Phase 3: UI Panels - COMPLETE ✅

Phase 3 implementation is complete! Full visual editor with Property Inspector, Layers Panel, Component Library, and Toolbar.

## What's Working

### Phase 1 & 2 - Core Systems ✅
✅ **EditableComponent wrapper** - Wraps HUD components to make them editable  
✅ **Selection system** - Click to select components, visual feedback  
✅ **Drag & drop** - Drag components with mouse or touch (GPU-accelerated)  
✅ **Resize system** - 8 resize handles (corners + midpoints)  
✅ **Keyboard shortcuts** - Arrow keys to nudge, Delete to remove, Escape to deselect  
✅ **History integration** - Undo/redo support for move and resize operations  
✅ **Visual feedback** - Selection outline with purple glow, component info label  
✅ **Constraints** - Canvas boundary clamping, min/max size enforcement  
✅ **Locked components** - Respects locked state (no drag/resize)

### Phase 3 - UI Panels ✅
✅ **Property Inspector** - Edit position, size, style, and layout properties via UI  
✅ **Layers Panel** - Manage z-index, visibility, lock state, delete/duplicate  
✅ **Component Library** - Add registered components to canvas with one click  
✅ **Toolbar** - Quick access to undo/redo, snap/grid toggles, panel controls  
✅ **Input Components** - Number inputs with +/-, sliders, toggles, dropdowns  
✅ **Real-time Updates** - All property changes apply immediately  
✅ **Collapsible Groups** - Organized property sections  

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
- **S** - Toggle snap (toolbar)
- **G** - Toggle grid (toolbar)

## UI Panels

### Property Inspector (Right Side)
Edit all properties of the selected component:
- **Layout**: Z-index, Visible toggle, Locked toggle
- **Position**: X, Y coordinates (in pixels)
- **Size**: Width, Height (in pixels)
- **Style**: Opacity, Blur, Border Radius, Scale, Shadow

### Layers Panel (Left Side)
Manage all components:
- View components sorted by z-index (highest first)
- Click to select
- 👁 - Toggle visibility
- 🔒 - Toggle lock
- 📋 - Duplicate component
- 🗑 - Delete component

### Component Library (Bottom Left)
Add new components:
- Browse registered components by category
- Click component card to add to canvas
- Components appear at canvas center

### Toolbar (Top Center)
Quick access to tools:
- ↶ / ↷ - Undo / Redo
- 🧲 - Toggle snap
- ⊞ - Toggle grid
- ⚙ - Toggle Property Inspector
- ☰ - Toggle Layers Panel
- 📦 - Toggle Component Library

## Mouse Controls

- **Click** - Select component
- **Drag** - Move component
- **Drag handles** - Resize component
- **Shift + Drag corner** - Maintain aspect ratio (TODO)
- **Alt + Drag** - Resize from center (TODO)

## Current Limitations

### Not Yet Implemented (Phase 4+):

- ❌ Snap system implementation (grid/component snapping logic)
- ❌ Alignment tools (align left/right/top/bottom, distribute)
- ❌ Validation panel (no warnings for overlaps, safe areas)
- ❌ Safe area guides visualization
- ❌ Layout save/load/export functionality
- ❌ Device preview switcher (preset selector is placeholder)
- ❌ Live data toggle
- ❌ Drag to reorder layers

### Known Issues:

- Component state must be manually initialized (no automatic detection yet)
- Snap toggle exists but snapping logic not implemented
- Grid toggle exists but grid not rendered
- Device selector is placeholder only
- Component Library only shows registered components (manual registration required)

## Architecture

### Component Flow

```
HUDStudioProvider (dev-only wrapper)
  └── EditModeWrapper (toggle button + panels)
      ├── Toolbar (top center)
      ├── PropertyInspector (right side)
      ├── LayersPanel (left side)
      ├── ComponentLibrary (bottom left)
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
5. Use the UI panels to edit properties!
   - **Property Inspector** - Edit position, size, style
   - **Layers Panel** - Manage z-index, visibility, lock
   - **Component Library** - Add registered components
   - **Toolbar** - Undo/redo, toggle panels

### To Continue Development (Phase 4):

Run the implementation tasks for Phase 4:
- Task 4.2: Snap System
- Task 4.3: Alignment Tools
- Task 4.4: Validation System
- Task 4.5: Safe Area Guides

---

**Status**: Phase 3 Complete (4/4 tasks done)  
**Next Phase**: Phase 4 - Systems (Snap, Alignment, Validation)  
**Overall Progress**: 17/33 tasks (52%)  
**Version**: 1.0.0-phase3  
**Last Updated**: 2025-01-XX
