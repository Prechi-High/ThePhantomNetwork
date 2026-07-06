# HUD Studio - Visual Editor

Internal development tool for visually editing, configuring, and exporting gameplay HUD layouts.

## Quick Start

### Enable HUD Studio

```typescript
// Wrap your GameplayHUD with HUDStudioProvider (dev only)
import { HUDStudioProvider } from '@/components/gameplay/hud-studio';

<HUDStudioProvider>
  <GameplayHUD />
</HUDStudioProvider>
```

### Register a Component

```typescript
import { componentRegistry } from '@/components/gameplay/hud-studio';

if (process.env.NODE_ENV === 'development') {
  componentRegistry.register({
    id: 'my-widget',
    displayName: 'My Widget',
    category: 'developer',
    component: MyWidget,
    defaultProps: {},
    editableProps: [],
    constraints: {
      minWidth: 0.1,
      minHeight: 0.05,
    },
  });
}
```

### Toggle Edit Mode

- **Keyboard**: `Cmd/Ctrl + E`
- **UI**: Click the edit mode toggle button

## Features

- **Visual Editing**: Drag, resize, and position HUD components
- **Property Inspector**: Adjust opacity, blur, colors, and more
- **Layers Panel**: Manage z-index and visibility
- **Responsive Preview**: Test across multiple device sizes
- **Import/Export**: Save and share layouts as JSON
- **Undo/Redo**: Full history system
- **Validation**: Automatic checks for overlaps, safe areas, and accessibility

## Architecture

- **State**: Zustand store with slices
- **History**: Command pattern for undo/redo
- **Transforms**: GPU-accelerated (translate3d)
- **Positions**: Normalized (0.0-1.0) for responsiveness

## Development

This module is development-only and automatically stripped from production builds via webpack configuration.

## Documentation

See `.kiro/specs/hud-studio/` for complete specification:
- `requirements.md` - Feature requirements and user stories
- `design.md` - Technical architecture and API specs
- `tasks.md` - Implementation tasks

---

*Version 1.0.0*
