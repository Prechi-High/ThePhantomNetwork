# LayoutEditorShell Component

Wrapper component around the existing HUD Studio editor that manages save/publish workflows. This component handles full-screen editor mode and modal dialogs for saving private layouts or publishing global layouts.

## Component Structure

```
LayoutEditorShell (index.tsx)
├── EditorHeader.tsx - Header with back, title, and save button
├── SavePrivateLayoutModal.tsx - Modal for saving private layouts
└── PublishGlobalLayoutModal.tsx - Modal for publishing global layouts
```

## Features

### LayoutEditorShell (Main Component)

**Purpose**: Full-screen editor wrapper that manages layout save/publish workflows without modifying the existing HUD Studio editor.

**Props**:
```typescript
interface LayoutEditorShellProps {
  layoutType: 'private' | 'global';  // Determines save behavior
  initialLayout?: LayoutConfig;      // Optional initial layout data
  onSaved?: () => void;              // Callback after successful save
}
```

**Key Features**:
- Full-screen editor mode (hides navigation)
- Loads initial layout via `useLayoutEditor()` hook
- Shows loading state while initializing
- Wraps HUD Studio editor without modifying it
- Manages save/publish modal dialogs
- Handles unsaved changes (future enhancement)
- Error handling with notifications

**Layout Structure**:
```
EditorHeader (sticky top-0)
├─ Back button → router.back()
├─ Title → "Edit Gameplay Layout" or "Edit Global Layout"
└─ Save button → Opens appropriate modal

Editor Container (flex-1, full height)
└─ HUDStudioProvider (existing)
    └─ HUDStudio (existing - DO NOT MODIFY)

SaveModal or PublishModal
└─ Confirmation dialog with save/publish flow
```

### EditorHeader

**Purpose**: Header bar above the editor with back button, title, and save action.

**Props**:
```typescript
interface EditorHeaderProps {
  title: string;           // "Edit Gameplay Layout" or "Edit Global Layout"
  onSave: () => void;      // Called when Save button clicked
  isSaving: boolean;       // Shows loading state
}
```

**Features**:
- Sticky positioning at top (z-50)
- Back button with chevron icon
- Centered title (truncates on mobile)
- Save button on right with loading state
- All elements minimum 44×44px touch targets
- Disabled state during saving
- Smooth transitions

**Styling**:
- Glass-morphism border and background
- Purple accent for save button
- Proper contrast and focus indicators

### SavePrivateLayoutModal

**Purpose**: Confirmation dialog for saving a private layout.

**Props**:
```typescript
interface SavePrivateLayoutModalProps {
  open: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}
```

**Dialog Content**:
- Title: "Save Gameplay Layout?"
- Description: Layout scope and privacy info
- Informational box with benefits
- Error display section
- Cancel and Save buttons

**Functionality**:
- Async confirmation handling
- Shows loading state during save
- Displays server errors
- Prevents closing during save
- Resets on cancel

### PublishGlobalLayoutModal

**Purpose**: Confirmation dialog for publishing a global layout (admin only).

**Props**:
```typescript
interface PublishGlobalLayoutModalProps {
  open: boolean;
  onConfirm: (changeNotes: string) => Promise<void>;
  onCancel: () => void;
}
```

**Dialog Content**:
- Title: "Publish as Global Layout?"
- Warning box with impact information
- Change notes textarea (optional)
- Error display section
- Cancel and Publish buttons

**Features**:
- Textarea for change notes (max 500 chars)
- Character counter
- Async confirmation with notes
- Loading state management
- Error handling

## Usage

### Private Layout Edit Page

```tsx
// app/(player)/profile/gameplay-layout/edit/page.tsx
'use client';

import { LayoutEditorShell } from '@/components/gameplay/LayoutEditorShell';

export default function EditLayoutPage() {
  return (
    <LayoutEditorShell
      layoutType="private"
      onSaved={() => {
        // Refresh profile or navigate
      }}
    />
  );
}
```

### Global Layout Edit Page (Admin)

```tsx
// app/(player)/profile/gameplay-layout/edit-global/page.tsx
'use client';

import { LayoutEditorShell } from '@/components/gameplay/LayoutEditorShell';

export default function EditGlobalLayoutPage() {
  return (
    <LayoutEditorShell
      layoutType="global"
      onSaved={() => {
        // Refresh profile or navigate
      }}
    />
  );
}
```

## Data Flow

### Private Layout Save Flow

```
Component Mount
  ↓
Load active layout via useLayoutEditor.loadLayout('private')
  ↓
Render editor in full-screen mode
  ↓
User edits layout in HUD Studio
  ↓
User clicks Save button
  ↓
Open SavePrivateLayoutModal
  ↓
User confirms save
  ↓
GET layout data from editor (via HUD Studio context/ref)
  ↓
POST /api/layouts/user with layout data
  ↓
Show success notification
  ↓
Call onSaved() callback
  ↓
Navigate to profile page
```

### Global Layout Publish Flow

```
Component Mount
  ↓
Load current global layout via useLayoutEditor.loadLayout('global')
  ↓
Render editor in full-screen mode with global indicator
  ↓
User edits layout in HUD Studio
  ↓
User clicks Save button
  ↓
Open PublishGlobalLayoutModal
  ↓
User enters change notes and confirms
  ↓
GET layout data from editor (via HUD Studio context/ref)
  ↓
POST /api/layouts/global with layout data + change notes
  ↓
Show success notification with new version number
  ↓
Call onSaved() callback
  ↓
Navigate to profile page
```

## API Integration

### Load Layout

```typescript
GET /api/layouts/active
Response:
{
  source: "private" | "global" | "default",
  layout: { ... },
  metadata: { ... }
}
```

### Save Private Layout

```typescript
POST /api/layouts/user
Body:
{
  layout: {
    components: { ... },
    version: "1.0.0",
    metadata: { ... }
  }
}

Response:
{
  success: boolean,
  layoutId: string,
  message?: string
}
```

### Publish Global Layout

```typescript
POST /api/layouts/global
Body:
{
  layout: { ... },
  changeNotes?: string
}

Response:
{
  success: boolean,
  version: number,
  layoutId: string,
  message?: string
}
```

## HUD Studio Integration

The editor container is designed to integrate with the existing HUD Studio component:

```tsx
{/* Current placeholder implementation */}
<div ref={editorRef} className="flex-1 overflow-hidden bg-phantom-background">
  <div className="w-full h-full flex items-center justify-center text-phantom-muted">
    <div className="text-center space-y-4">
      <div className="text-6xl">🎨</div>
      <p className="text-lg">HUD Studio Editor</p>
      <p className="text-sm text-phantom-muted">
        Ready for integration with HUD Studio component
      </p>
    </div>
  </div>
</div>

{/* Should be replaced with actual HUD Studio: */}
{/*
<HUDStudioProvider initialLayout={layout}>
  <HUDStudio onLayoutChange={handleLayoutChange} />
</HUDStudioProvider>
*/}
```

### Integration Steps

1. Import HUD Studio components
2. Remove placeholder div
3. Connect `initialLayout` state to HUD Studio
4. Implement `getLayoutFromEditor()` to extract serialized layout
5. Handle layout change callbacks

## Styling

### Classes Used

- `phantom-surface` - Background color
- `phantom-border` - Border dividers
- `phantom-purple` - Primary action color
- `phantom-muted` - Secondary text
- `phantom-danger` - Destructive actions

### Full-Screen Behavior

- Takes entire viewport (`h-screen`)
- Hides navigation and header
- No scrolling (editor manages its own scrolling)
- Fixed positioning for header
- Flex layout for proper sizing

## Accessibility

- Proper aria-labels on buttons
- Semantic HTML structure
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Loading states clearly indicated
- Error messages accessible

## Error Handling

1. **Layout Load Error**:
   - Shows notification
   - Returns to previous page

2. **Save Failure**:
   - Error shown in modal
   - User can retry or cancel
   - Modal stays open

3. **Permission Error**:
   - 403 response handling
   - User-friendly message
   - Redirect to profile

4. **Network Error**:
   - Clear error message
   - Retry option
   - Fallback handling

## Mobile Optimization

- Full viewport usage
- Touch-friendly controls (44×44px minimum)
- Header sticks to top for visibility
- Modal centered on screen
- Responsive text sizing
- Proper z-indexing for overlays

## Performance Considerations

- Single layout fetch on mount
- Lazy loading support (future)
- Memoization of callbacks
- Efficient state updates
- Modal animations smooth

## State Management

```typescript
- isLoading: boolean              // Initial load state
- showSaveModal: boolean          // Modal visibility
- isSaving: boolean               // Save operation state
- editorRef: React.RefObject      // Editor DOM reference
```

## Hooks Used

- `useLayoutEditor()` - Layout operations
- `useRouter()` - Navigation
- `useNotifications()` - Toast notifications
- `useRef()` - Editor reference
- `useEffect()` - Lifecycle
- `useState()` - Local state

## Testing

Key test cases:

1. **Mount & Load**: Verify layout loads on mount
2. **Save Private**: Test private layout save flow
3. **Publish Global**: Test global layout publish
4. **Error Handling**: Test error scenarios
5. **Navigation**: Test back button behavior
6. **Loading States**: Verify loading UI
7. **Modal Interactions**: Test modal open/close
8. **Mobile**: Test on mobile viewport

## Related Components

- `GameplayLayoutSettings` - Settings entry point
- `GlobalLayoutHistory` - Version history view
- `Dialog` - Modal component (reusable UI)
- `EditorHeader` - Header component
- `SavePrivateLayoutModal` - Private save dialog
- `PublishGlobalLayoutModal` - Global publish dialog

## Future Enhancements

1. **Unsaved Changes**: Implement detection and confirmation
2. **Auto-save**: Add periodic auto-save feature
3. **Preview**: Add layout preview before save
4. **Undo/Redo**: Implement undo/redo stack
5. **Shortcuts**: Add keyboard shortcuts for save (Ctrl+S)
6. **Analytics**: Track editor usage and save patterns
