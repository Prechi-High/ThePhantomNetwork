# Layout Access Control Components - Implementation Guide

Complete guide for implementing and integrating the gameplay layout access control UI components.

## Components Overview

Three main component sets have been implemented:

### 1. GameplayLayoutSettings
Location: `src/components/gameplay/GameplayLayoutSettings/`

**Purpose**: Settings page for managing layout preferences
**Entry Point**: Profile page bottom section
**Users**: All players and admins

**Subcomponents**:
- `StatusCard.tsx` - Current layout status display
- `ActionButtons.tsx` - Role-based action buttons
- `ResetConfirmationDialog.tsx` - Reset confirmation modal

### 2. LayoutEditorShell
Location: `src/components/gameplay/LayoutEditorShell/`

**Purpose**: Wrapper for HUD Studio editor with save/publish workflows
**Entry Points**: Edit private layout, Edit global layout (admin)
**Users**: All players (edit private), Admins only (edit global)

**Subcomponents**:
- `EditorHeader.tsx` - Header with back and save buttons
- `SavePrivateLayoutModal.tsx` - Private layout save dialog
- `PublishGlobalLayoutModal.tsx` - Global layout publish dialog

### 3. GlobalLayoutHistory
Location: `src/components/gameplay/GlobalLayoutHistory/`

**Purpose**: Version history management for global layouts
**Entry Point**: Version history link (admin only)
**Users**: Admins only

**Subcomponents**:
- `VersionList.tsx` - List of layout versions
- `RestoreConfirmationDialog.tsx` - Restore confirmation modal

## Integration Steps

### Step 1: Add Components to Profile Page

Update `src/app/(player)/profile/page.tsx`:

```tsx
import { GameplayLayoutSettings } from '@/components/gameplay/GameplayLayoutSettings';

export default function ProfilePage() {
  // ... existing profile code ...

  return (
    <div className="space-y-8 pb-24">
      {/* Existing sections */}

      {/* Add Gameplay Layout Settings */}
      <GameplayLayoutSettings />
    </div>
  );
}
```

### Step 2: Create Route Pages

#### Edit Private Layout Page

```tsx
// src/app/(player)/profile/gameplay-layout/edit/page.tsx
'use client';

import { LayoutEditorShell } from '@/components/gameplay/LayoutEditorShell';
import { useRouter } from 'next/navigation';

export default function EditLayoutPage() {
  const router = useRouter();

  return (
    <LayoutEditorShell
      layoutType="private"
      onSaved={() => {
        router.push('/profile?tab=overview');
      }}
    />
  );
}
```

#### Edit Global Layout Page (Admin)

```tsx
// src/app/(player)/profile/gameplay-layout/edit-global/page.tsx
'use client';

import { LayoutEditorShell } from '@/components/gameplay/LayoutEditorShell';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { useEffect } from 'react';

export default function EditGlobalLayoutPage() {
  const router = useRouter();
  const { isAdmin, loading } = useUserRole();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/profile');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <LayoutEditorShell
      layoutType="global"
      onSaved={() => {
        router.push('/profile?tab=overview');
      }}
    />
  );
}
```

#### Version History Page (Admin)

```tsx
// src/app/(player)/profile/gameplay-layout/history/page.tsx
'use client';

import { GlobalLayoutHistory } from '@/components/gameplay/GlobalLayoutHistory';
import { useUserRole } from '@/lib/hooks/useUserRole';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HistoryPage() {
  const router = useRouter();
  const { isAdmin, loading } = useUserRole();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/profile');
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return <GlobalLayoutHistory />;
}
```

### Step 3: Implement Backend API Endpoints

All endpoints are already designed and documented. Create these endpoints:

#### GET /api/layouts/active

```typescript
// src/app/api/layouts/active/route.ts
export async function GET(request: Request) {
  try {
    // 1. Verify authentication
    // 2. Query user_layouts WHERE user_id = auth.uid AND is_active = true
    // 3. If found: Return { source: 'private', layout, metadata }
    // 4. Else: Query global_layouts WHERE is_active = true
    // 5. If found: Return { source: 'global', layout, metadata }
    // 6. Else: Return { source: 'default', layout: SYSTEM_DEFAULT }
  }
}
```

#### POST /api/layouts/user

```typescript
// src/app/api/layouts/user/route.ts
export async function POST(request: Request) {
  try {
    // 1. Verify authentication
    // 2. Extract layout from body
    // 3. Validate layout JSON schema
    // 4. Deactivate previous layouts
    // 5. Create new layout with is_active = true
    // 6. Return { success: true, layoutId }
  }
}

export async function DELETE(request: Request) {
  try {
    // 1. Verify authentication
    // 2. Set is_active = false for user's active layout
    // 3. Return { success: true }
  }
}
```

#### POST /api/layouts/global

```typescript
// src/app/api/layouts/global/route.ts
export async function POST(request: Request) {
  try {
    // 1. Verify authentication and admin role
    // 2. Extract layout and changeNotes
    // 3. Validate layout
    // 4. Archive current active layout to history
    // 5. Create new active layout with incremented version
    // 6. Return { success: true, version, layoutId }
  }
}
```

#### GET /api/layouts/global/history

```typescript
// src/app/api/layouts/global/history/route.ts
export async function GET(request: Request) {
  try {
    // 1. Verify authentication and admin role
    // 2. Query global_layout_history
    // 3. ORDER BY version DESC LIMIT 100
    // 4. Return { versions: [...] }
  }
}
```

#### POST /api/layouts/global/restore

```typescript
// src/app/api/layouts/global/restore/route.ts
export async function POST(request: Request) {
  try {
    // 1. Verify authentication and admin role
    // 2. Get history record by versionId
    // 3. Archive current active layout
    // 4. Copy history record to global_layouts
    // 5. Increment version number
    // 6. Return { success: true, newVersion }
  }
}
```

### Step 4: Connect HUD Studio Editor

In `src/components/gameplay/LayoutEditorShell/index.tsx`, replace the placeholder with actual editor:

```tsx
// Replace this:
<div className="w-full h-full flex items-center justify-center text-phantom-muted">
  {/* Placeholder */}
</div>

// With this:
<HUDStudioProvider initialLayout={layout} onLayoutChange={handleLayoutChange}>
  <HUDStudio />
</HUDStudioProvider>
```

Implement the layout extraction function:

```tsx
function getLayoutFromEditor(): LayoutConfig {
  // Get current editor state from HUD Studio context or ref
  // Serialize to LayoutConfig format
  // Return layout data
}
```

### Step 5: Database Schema

Run the migration in `scripts/migrations/`:

```sql
-- Already created migration file with all tables
-- See: 20260707025902_create_layout_tables.sql

-- Run via Supabase dashboard or:
-- npx supabase db push
```

### Step 6: Test All Flows

#### Standard Player Flow
1. Navigate to Profile
2. See Gameplay Layout section
3. Click "Edit Gameplay Layout"
4. Make changes in editor
5. Click Save
6. Confirm save
7. Check layout is saved in DB
8. Verify next session uses custom layout

#### Admin Private Layout Flow
1. Same as standard player
2. Verify admin editing private layout doesn't affect global

#### Admin Global Layout Flow
1. Navigate to Gameplay Layout
2. Click "Edit Global Layout" (button only visible to admins)
3. Make changes in editor
4. Click Save
5. Confirm publish with change notes
6. Verify new version created
7. Verify previous version archived

#### Admin Version History Flow
1. Click "View Version History" (admin only button)
2. See list of all versions
3. Select a version to restore
4. Enter optional reason
5. Confirm restore
6. Verify restored as new version
7. Verify previous version archived

#### Reset Flow
1. Click "Reset to Default"
2. Confirm reset
3. Verify private layout deleted
4. Verify next session uses global layout

## Component Dependencies

### UI Components Required
- `Button.tsx` - Already exists
- `Card.tsx` - Already exists
- `Badge.tsx` - Already exists
- `Dialog.tsx` - Created in this task ✓
- `Skeleton.tsx` - Created in this task ✓

### Hooks Required
- `useLayoutEditor()` - Already exists
- `useUserRole()` - Already exists
- `useNotifications()` - Already exists

### Types Required
- `LayoutConfig` - Already defined
- `LayoutStatus` - Already defined
- `UserProfile` - Already defined
- `GlobalLayoutVersionInfo` - Already defined
- All other types in `src/lib/types/layout.ts` - Already defined ✓

### External Libraries
- `date-fns` - Already installed (for formatDistanceToNow)
- `lucide-react` - Already installed (for icons)
- `framer-motion` - Already installed (for animations)
- `next/navigation` - Already installed

## File Structure

```
src/components/gameplay/
├── GameplayLayoutSettings/
│   ├── index.tsx (Main component)
│   ├── StatusCard.tsx
│   ├── ActionButtons.tsx
│   ├── ResetConfirmationDialog.tsx
│   └── README.md
├── LayoutEditorShell/
│   ├── index.tsx (Main component)
│   ├── EditorHeader.tsx
│   ├── SavePrivateLayoutModal.tsx
│   ├── PublishGlobalLayoutModal.tsx
│   └── README.md
├── GlobalLayoutHistory/
│   ├── index.tsx (Main component)
│   ├── VersionList.tsx
│   ├── RestoreConfirmationDialog.tsx
│   └── README.md
└── hud-studio/ (Existing - DO NOT MODIFY)

src/components/ui/
├── Dialog.tsx (New)
├── Skeleton.tsx (New)
└── ... (Existing)

src/app/(player)/profile/
├── page.tsx (Update to add GameplayLayoutSettings)
└── gameplay-layout/
    ├── edit/
    │   └── page.tsx (New)
    ├── edit-global/
    │   └── page.tsx (New)
    └── history/
        └── page.tsx (New)

src/app/api/layouts/
├── active/
│   └── route.ts (New)
├── user/
│   └── route.ts (New)
├── global/
│   ├── route.ts (New)
│   ├── history/
│   │   └── route.ts (New)
│   └── restore/
│       └── route.ts (New)
```

## Testing Checklist

### Component Tests
- [ ] GameplayLayoutSettings loads and displays status
- [ ] ActionButtons show correct buttons for role
- [ ] StatusCard displays correct metadata
- [ ] ResetConfirmationDialog shows confirmation
- [ ] LayoutEditorShell loads and displays editor
- [ ] EditorHeader shows correct title
- [ ] SavePrivateLayoutModal saves layout
- [ ] PublishGlobalLayoutModal publishes with notes
- [ ] GlobalLayoutHistory loads versions
- [ ] VersionList displays versions correctly
- [ ] RestoreConfirmationDialog restores version

### Integration Tests
- [ ] Profile page displays GameplayLayoutSettings
- [ ] Navigation from settings to edit works
- [ ] Navigation from edit back to settings works
- [ ] Save layout updates database
- [ ] Reset layout deletes private layout
- [ ] Publish layout creates new version
- [ ] Restore version works correctly
- [ ] Permission checks prevent unauthorized access

### Mobile Tests
- [ ] All buttons are 44×44px minimum
- [ ] Layout is single column on mobile
- [ ] Editor uses full screen on mobile
- [ ] Modals are centered and accessible
- [ ] Touch interactions work smoothly
- [ ] No horizontal scroll

### Error Tests
- [ ] 403 errors handled correctly
- [ ] Network errors show retry
- [ ] Empty states display correctly
- [ ] Loading states show properly
- [ ] Error messages are helpful
- [ ] Notifications display correctly

## Performance Metrics

Target metrics:

- Layout load: < 500ms
- Editor launch: < 2 seconds
- Save operation: < 1 second
- API response: < 500ms
- Component mount: < 100ms

## Deployment Checklist

- [ ] All components compile without errors
- [ ] All dependencies installed
- [ ] Database migrations run successfully
- [ ] API endpoints tested and working
- [ ] Navigation routes created
- [ ] HUD Studio editor integrated
- [ ] Error handling implemented
- [ ] Notifications working
- [ ] Mobile responsive verified
- [ ] Accessibility tested
- [ ] Type safety verified (no 'any' types)
- [ ] Performance acceptable

## Troubleshooting

### Dialog not appearing
- Check DialogContext is provided
- Verify Dialog wraps DialogContent
- Check open prop is true

### Layout not saving
- Verify API endpoint exists
- Check authentication headers sent
- Verify JSON validation on backend
- Check database write permissions

### Version history empty
- Verify global layouts have been published
- Check admin role verification
- Verify API endpoint returns data
- Check database query

### Permission denied errors
- Verify user role in database
- Check backend permission validation
- Verify role check logic
- Review RLS policies if using Supabase

### Mobile layout issues
- Check viewport meta tag set
- Verify touch-friendly sizing (44px minimum)
- Check no horizontal scroll
- Verify responsive classes applied

## Support & Documentation

- `GameplayLayoutSettings/README.md` - Component documentation
- `LayoutEditorShell/README.md` - Editor integration guide
- `GlobalLayoutHistory/README.md` - History management guide
- `.kiro/specs/layout-access-control/` - Full specifications
- API endpoint documentation in design document

## Next Steps

1. **Immediate**: Create route pages and integrate components
2. **Backend**: Implement API endpoints
3. **Integration**: Connect HUD Studio editor
4. **Testing**: Test all user flows
5. **Deployment**: Deploy to production
6. **Monitoring**: Track usage and errors
7. **Iteration**: Gather user feedback and improve

---

**Implementation Status**: Components complete and ready for integration
**Last Updated**: 2025-01-15
**Maintainer**: Development Team
