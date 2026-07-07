# GlobalLayoutHistory Component

Admin-only view for managing global layout version history. Allows administrators to view all previous global layout versions, read change notes, and restore previous versions if needed.

## Component Structure

```
GlobalLayoutHistory (index.tsx)
├── VersionList.tsx - Renders list of layout versions
└── RestoreConfirmationDialog.tsx - Modal for confirming restore
```

## Features

### GlobalLayoutHistory (Main Component)

**Purpose**: Display all global layout versions with restore functionality.

**Props**: None (uses hooks for admin check and data fetching)

**Key Features**:
- Lists all global layout versions (newest first)
- Shows version metadata (number, date, publisher, notes)
- Restore button for each version
- Loading state while fetching
- Empty state when no versions
- Error state with retry option
- Admin-only access (enforced at backend, hidden in UI)
- Mobile-responsive design

**State Management**:
```typescript
- versions: GlobalLayoutVersionInfo[]
- loading: boolean
- error: string | null
- selectedVersion: GlobalLayoutVersionInfo | null
- showRestoreDialog: boolean
- isRestoring: boolean
```

**Access Control**:
- Component loads versions via API
- Backend validates admin role (403 if not authorized)
- Frontend displays permission error
- No client-side auth bypass possible

### VersionList

**Purpose**: Render list of layout versions with metadata and restore buttons.

**Props**:
```typescript
interface VersionListProps {
  versions: GlobalLayoutVersionInfo[];
  loading: boolean;
  onRestore: (versionId: string) => void;
  isRestoring?: boolean;
}
```

**Display Elements Per Version**:
- **Version Header**:
  - Version label (e.g., "v2.4")
  - Version number (e.g., "v2")
  - Published date (e.g., "2 days ago")
  - Published by username

- **Change Notes** (if present):
  - Displayed in secondary styled box
  - Formatted as read-only text

- **Restore Button**:
  - Purple variant
  - Shows loading state when restoring
  - Disabled during restore operation
  - Touch-friendly (44×48px minimum)

**Empty State**:
- Shows when no versions exist
- Emoji: 📭
- Message: "No versions published yet"
- Instruction text

**Loading State**:
- Skeleton cards for list items
- Smooth animation
- Shows 3 skeleton placeholders

### RestoreConfirmationDialog

**Purpose**: Modal for confirming restoration of a previous version.

**Props**:
```typescript
interface RestoreConfirmationDialogProps {
  open: boolean;
  version: GlobalLayoutVersionInfo | null;
  onConfirm: (changeNotes: string) => Promise<void>;
  onCancel: () => void;
}
```

**Dialog Content**:
- Title: "Restore [version label] as Current?"
- Description: Explains archival of current version
- Information box showing:
  - Version being restored
  - Originally published by
  - Original change notes (if any)
- Optional "Reason for Restore" textarea
- Error display section
- Cancel and Restore buttons

**Features**:
- Async confirmation handling
- Shows loading state during restore
- Displays server errors
- Prevents closing during restore
- Resets state on cancel
- Optional change notes for audit trail

## Usage

### Integration in Profile Settings

```tsx
import { GlobalLayoutHistory } from '@/components/gameplay/GlobalLayoutHistory';

export default function LayoutHistoryPage() {
  return <GlobalLayoutHistory />;
}
```

### As a Route Page

```tsx
// app/(player)/profile/gameplay-layout/history/page.tsx
'use client';

import { GlobalLayoutHistory } from '@/components/gameplay/GlobalLayoutHistory';

export default function HistoryPage() {
  return <GlobalLayoutHistory />;
}
```

## Data Flow

```
Component Mount
  ↓
useNotifications & useRouter hooks initialize
  ↓
loadVersions() called
  ↓
GET /api/layouts/global/history
  ↓
Check if 403 (not admin)
  ↓
Display error if unauthorized
  ↓
Display version list if authorized
  ↓
User selects version to restore
  ↓
Show RestoreConfirmationDialog
  ↓
User enters optional change notes
  ↓
User confirms restore
  ↓
POST /api/layouts/global/restore
  ↓
Show success notification with new version
  ↓
Reload version list
```

## API Integration

### Fetch Version History

```typescript
GET /api/layouts/global/history

Response (Admin Only):
{
  versions: [
    {
      id: "uuid",
      version: 2,
      versionLabel: "v2.4",
      publishedBy: "admin_username",
      publishedAt: "2025-01-14T10:00:00Z",
      changeNotes: "Improved button visibility"
    },
    // ... more versions (newest first)
  ]
}

Error (Not Admin):
{
  status: 403,
  error: "You do not have permission to view layout history"
}
```

### Restore Version

```typescript
POST /api/layouts/global/restore

Body:
{
  versionId: "uuid",
  changeNotes: "Optional reason for restore" // optional
}

Response:
{
  success: boolean,
  newVersion: number,
  message?: string
}

Example Response:
{
  success: true,
  newVersion: 3,
  message: "Layout v2.3 restored as v3"
}
```

## Styling

### Classes Used

- `phantom-surface` - Card backgrounds
- `phantom-border` - Border dividers
- `phantom-purple` - Primary color and buttons
- `phantom-muted` - Secondary text
- `phantom-background` - Page background

### Layout Classes

- Grid-based version cards
- Flex for button positioning
- Responsive gaps
- Hover effects on cards
- Smooth transitions

## Accessibility

- Proper aria-labels on buttons
- Semantic HTML (button, dialog)
- Keyboard navigation support
- Focus management in modal
- Color contrast compliance
- Error messages accessible
- Loading states announced
- Back button accessible

## Error Handling

1. **Authorization Error (403)**:
   - Clear message: "You do not have permission..."
   - Displayed in error box
   - Retry button to reload

2. **Network Error**:
   - User-friendly message
   - Shows error text
   - Provides retry option

3. **Restore Failure**:
   - Error shown in modal
   - User can retry or cancel
   - Modal stays open

4. **Empty State**:
   - Shown when no versions exist
   - Instructional message
   - No error state

## Mobile Optimization

- Single column layout
- Full-width version cards
- Touch-friendly buttons (44×48px)
- Proper spacing (8px minimum)
- Readable text at 14px+
- Modal centered on screen
- No horizontal scroll

## State Management

```typescript
const [versions, setVersions] = useState<GlobalLayoutVersionInfo[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [selectedVersion, setSelectedVersion] = useState<GlobalLayoutVersionInfo | null>(null);
const [showRestoreDialog, setShowRestoreDialog] = useState(false);
const [isRestoring, setIsRestoring] = useState(false);
```

## Hooks Used

- `useRouter()` - Navigation (back button)
- `useNotifications()` - Toast notifications
- `useEffect()` - Load versions on mount
- `useState()` - Component state

## Performance Considerations

- Single fetch on mount
- Versions sorted by date (server-side)
- Limit to 100 most recent versions
- Error states prevent infinite loops
- Memoized callbacks
- Efficient re-renders

## Type Definitions

Used from `src/lib/types/layout.ts`:

- `GlobalLayoutVersionInfo` - Version metadata
- `GetGlobalHistoryResponse` - API response type
- `PostGlobalRestoreRequest` - API request type
- `PostGlobalRestoreResponse` - API response type

## Permission Model

### Authorization Flow

1. **Backend Check (Strict)**:
   - All endpoints verify admin role
   - Checks `profiles.role IN ('admin', 'platform_designer')`
   - Returns 403 if not authorized
   - Never exposes data to unauthorized users

2. **Frontend Check (UI Only)**:
   - Not security-related
   - Only for UX optimization
   - Hides buttons for non-admins
   - Can be bypassed (doesn't matter - backend validates)

3. **Component Access**:
   - Component itself has no auth check
   - Relies on backend to reject unauthorized requests
   - Page-level auth can be added if needed

## Testing

Key test cases:

1. **Load Versions**: Verify versions load on mount
2. **Display List**: Check version display format
3. **Restore Flow**: Test restore confirmation and API call
4. **Authorization**: Test 403 handling
5. **Error States**: Test error display and retry
6. **Loading States**: Verify loading UI
7. **Empty State**: Test when no versions
8. **Mobile Layout**: Test responsive design
9. **Pagination**: Test with many versions (future)

## Related Components

- `GameplayLayoutSettings` - Settings entry point
- `LayoutEditorShell` - Editor wrapper
- `Dialog` - Modal component (reusable UI)
- `VersionList` - Version list display
- `RestoreConfirmationDialog` - Restore confirmation modal

## Future Enhancements

1. **Pagination**: Add pagination for many versions
2. **Preview**: Add layout preview for each version
3. **Compare**: Allow comparing two versions side-by-side
4. **Export**: Add ability to export version as JSON
5. **Bulk Actions**: Archive/delete old versions
6. **Search**: Filter versions by date or publisher
7. **Filtering**: Filter by range, publisher, or status
8. **Analytics**: Track restore frequency and patterns

## Audit Trail

Version restore creates an audit trail:

- **Original Version**: v2.3 (published by admin1 on 2025-01-10)
- **Restore Date**: 2025-01-15
- **Restored By**: admin2
- **Reason**: "Reverting due to user feedback"
- **New Version**: v3 (represents the restored version)

This allows tracing history of layout changes and decisions.

## Best Practices

1. **Regular Reviews**: Admins should review version history regularly
2. **Descriptive Notes**: Always include change notes for major updates
3. **Testing Before Publish**: Test in private layout before global publish
4. **Documentation**: Document significant changes for audit trail
5. **Version Numbering**: Follow semantic versioning (v1.0, v1.1, v2.0)
6. **Restore Caution**: Verify before restoring (affects all users)
