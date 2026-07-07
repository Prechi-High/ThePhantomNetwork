# GameplayLayoutSettings Component

Main component for displaying and managing gameplay layout settings. Located in the Profile page, this component allows players to view their current layout status and access layout editor.

## Component Structure

```
GameplayLayoutSettings (index.tsx)
├── StatusCard.tsx - Displays current layout info
├── ActionButtons.tsx - Role-based action buttons
└── ResetConfirmationDialog.tsx - Reset confirmation modal
```

## Features

### GameplayLayoutSettings (Main Component)

**Purpose**: Main settings component that loads layout status and manages user interactions.

**Props**: None (uses custom hooks)

**Key Features**:
- Loads active layout status on mount
- Manages dialog states for reset confirmation
- Handles reset to global layout action
- Provides role-based visibility (admin vs standard player)
- Shows success/error notifications

**State Management**:
```typescript
- status: LayoutStatus | null
- loading: boolean
- error: string | null
- showResetDialog: boolean
```

**Hooks Used**:
- `useLayoutEditor()` - For layout operations
- `useUserRole()` - For permission checks
- `useNotifications()` - For toast notifications

### StatusCard

**Purpose**: Display current layout information in a card format.

**Props**:
```typescript
interface StatusCardProps {
  status: LayoutStatus | null;
  loading: boolean;
  error?: string | null;
}
```

**Display Elements**:
- Current Active Layout heading
- Layout source badge (Private/Global/Default with emoji)
- Metadata list:
  - Source indicator
  - Version number (for global layouts)
  - Published by (for global layouts)
  - Last updated (using date-fns formatDistanceToNow)

**Styles**:
- Uses phantom-purple/success/muted badge variants
- Gradient divider between header and content
- Loading state with skeleton loaders

### ActionButtons

**Purpose**: Render role-based action buttons.

**Props**:
```typescript
interface ActionButtonsProps {
  isAdmin: boolean;
  onResetClick: () => void;
  isLoading?: boolean;
}
```

**Buttons**:

1. **Edit Gameplay Layout** (Standard + Admin)
   - Links to `/profile/gameplay-layout/edit`
   - Primary action for players and admins
   - Emoji: ✏️

2. **Edit Global Layout** (Admin Only)
   - Links to `/profile/gameplay-layout/edit-global`
   - Secondary variant styling
   - Emoji: 🌍

3. **Reset to Default** (Standard + Admin)
   - Triggers reset confirmation dialog
   - Danger variant styling
   - Emoji: ↻

4. **View Version History** (Admin Only)
   - Links to `/profile/gameplay-layout/history`
   - Ghost variant styling
   - Emoji: 📋

**Mobile Responsiveness**:
- All buttons minimum 44×44px for touch targets
- Single column layout
- 8px+ spacing between buttons

### ResetConfirmationDialog

**Purpose**: Modal for confirming the reset to default action.

**Props**:
```typescript
interface ResetConfirmationDialogProps {
  open: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
```

**Dialog Content**:
- Title: "Reset to Default Layout?"
- Warning message: "Your custom layout will be deleted. You will use the current global layout."
- Additional warning about irreversibility
- Error display section
- Cancel and Reset buttons

**Functionality**:
- Handles async confirmation
- Shows loading state during reset
- Displays errors from server
- Prevents closing during reset (loading state)

## Usage

### Basic Integration

```tsx
import { GameplayLayoutSettings } from '@/components/gameplay/GameplayLayoutSettings';

export default function ProfilePage() {
  return (
    <div>
      {/* Other profile sections */}
      <GameplayLayoutSettings />
    </div>
  );
}
```

## Data Flow

```
Mount
  ↓
useLayoutEditor & useUserRole hooks initialize
  ↓
Load active layout status via GET /api/layouts/active
  ↓
Display status in StatusCard
  ↓
Render role-based ActionButtons

User clicks "Reset to Default"
  ↓
Show ResetConfirmationDialog
  ↓
User confirms
  ↓
DELETE /api/layouts/user
  ↓
Show success notification
  ↓
Reload layout status
```

## API Integration

### Fetch Layout Status

```typescript
GET /api/layouts/active
Response:
{
  source: "private" | "global" | "default",
  layout: { ... },
  metadata: {
    version?: number,
    versionLabel?: string,
    lastUpdated: string,
    publishedBy?: string
  }
}
```

### Reset Layout

```typescript
DELETE /api/layouts/user
Response:
{
  success: boolean,
  message?: string
}
```

## Styling

### Classes Used

- `phantom-purple` - Primary brand color
- `phantom-surface` - Card backgrounds
- `phantom-border` - Border dividers
- `phantom-muted` - Secondary text
- `phantom-danger` - Destructive actions

### Tailwind Utilities

- Min height 44px for touch targets
- Full width buttons for mobile
- Single column layout (lg: can be enhanced for desktop)
- Gradient dividers
- Skeleton animations for loading

## Accessibility

- All buttons have proper aria-labels
- Semantic HTML (buttons, links)
- Color contrast meets WCAG standards
- Focus indicators visible
- Error messages announced
- Loading states clear
- Touch targets meet 44×44px minimum

## Error Handling

1. **Layout Load Failure**: 
   - Displays error message in StatusCard
   - Shows retry opportunity

2. **Reset Failure**:
   - Error shown in dialog
   - User can retry
   - Dialog stays open

3. **Permission Errors**:
   - Admin buttons hidden if not authorized
   - Backend validates permissions

## Mobile Optimization

- Touch-friendly button sizing (44×44px minimum)
- Single column layout
- Proper spacing (8px minimum)
- No horizontal scroll
- Readable text at 14px+
- Responsive gap sizes

## Integration Points

### Parent Component (Profile Page)

The GameplayLayoutSettings component should be integrated into the Profile page like:

```tsx
<div className="space-y-8">
  {/* Other profile sections */}
  
  {/* Gameplay Layout Settings */}
  <GameplayLayoutSettings />
</div>
```

### Next Steps

1. **Routes**: Create the following route pages:
   - `/profile/gameplay-layout/edit` (LayoutEditorShell with layoutType="private")
   - `/profile/gameplay-layout/edit-global` (LayoutEditorShell with layoutType="global")
   - `/profile/gameplay-layout/history` (GlobalLayoutHistory)

2. **API Endpoints**: Implement backend endpoints:
   - `GET /api/layouts/active`
   - `DELETE /api/layouts/user`

3. **HUD Studio Integration**: Connect the LayoutEditorShell to actual HUD Studio editor component

## Type Definitions

All types are defined in `src/lib/types/layout.ts`:

- `LayoutStatus` - Current layout state
- `LayoutConfig` - Layout configuration
- `UserRole` - User permission level
- `UserProfile` - User data with role

## Performance Considerations

- Layout status cached during component lifecycle
- Single fetch on mount
- Loading states prevent multiple requests
- Notifications shown without page reload
- Error handling prevents hung states

## Testing

Key test cases:

1. **Display Status**: Verify correct status and metadata display
2. **Admin Buttons**: Test admin buttons appear for admin role
3. **Standard Buttons**: Test standard buttons for player role
4. **Reset Flow**: Test reset confirmation and API call
5. **Error States**: Test error display and retry
6. **Loading States**: Test loading skeletons and disabled states
7. **Mobile Responsiveness**: Test on 390px viewport
8. **Touch Targets**: Verify 44px minimum sizing

## Related Components

- `LayoutEditorShell` - Full-screen editor wrapper
- `GlobalLayoutHistory` - Version history and restore
- `Dialog` - Modal component (reusable UI)
- `StatusCard` - Layout status display
- `ActionButtons` - Button group component
- `ResetConfirmationDialog` - Confirmation modal
