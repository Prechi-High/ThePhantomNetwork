# Gameplay Layout Access Control & Publishing - Design Document

## Executive Summary

This design document provides the technical architecture for implementing role-based access controls, user-facing UI, database persistence, and publishing workflows around the existing HUD Studio editor. The feature allows players to customize their HUD layout privately and authorized administrators to publish global layouts that apply to all players.

**Design Philosophy:**
- Never modify the existing HUD Studio editor core
- Implement access control at navigation, routing, and API layers
- Use context/provider pattern to wrap editor with save workflows
- Enforce permissions strictly on backend, hide UI on frontend
- Optimize entire workflow for mobile and Telegram Mini App

---

## 1. System Architecture

### 1.1 Navigation & Routing Structure

```
Profile Page (existing)
├── Gameplay Layout Settings (new)
│   ├── Status display (private/global/default)
│   ├── Action buttons (Edit, Edit Global [admin], Reset, View History [admin])
│   └── Mobile-optimized layout
│
├── Edit Gameplay Layout Flow (new)
│   ├── GET /profile/gameplay-layout/edit
│   ├── Loads user's private OR global layout
│   ├── Wraps editor with SaveLayoutModal
│   └── Routes back to settings on save/cancel
│
├── Edit Global Layout Flow (new, admin only)
│   ├── GET /profile/gameplay-layout/edit-global
│   ├── Admin check middleware
│   ├── Loads current global layout
│   ├── Wraps editor with PublishLayoutModal
│   └── Routes back to settings on save/cancel
│
└── Version History View (new, admin only)
    ├── GET /profile/gameplay-layout/history
    ├── Shows all previous versions
    └── Restore action routes to edit-global with history context
```

### 1.2 Component Hierarchy

```
Profile Page
└── GameplayLayoutSettings (new)
    ├── Displays layout status
    ├── Handles role-based button visibility
    ├── Manages current layout state
    └── Provides navigation to edit flows

    ├── (if editing private)
    └── GameplayLayoutEditor (new wrapper)
        ├── LayoutEditorShell (new)
        │   ├── EditorHeader (new)
        │   │   ├── Back button
        │   │   ├── Title ("Edit Gameplay Layout" or "Edit Global Layout")
        │   │   └── Save button
        │   ├── HUDStudioProvider (existing)
        │   │   └── HUDStudio (existing - unchanged)
        │   └── SaveLayoutModal (new)
        │       ├── Private save flow
        │       └── Global publish flow (admin only)
        └── useLayoutEditor (new hook)
            ├── Loads initial layout data
            ├── Tracks editor state
            ├── Handles save/publish
            └── Error handling

    └── (if viewing history)
    └── GlobalLayoutHistory (new)
        ├── Lists all versions
        ├── Version metadata display
        └── Restore action handler
```

---

## 2. Data Models & TypeScript Interfaces

### 2.1 Layout Data Structure

```typescript
// src/lib/types/layout.ts

/**
 * Represents a saved HUD layout configuration.
 * Contains normalized component positions and properties.
 */
export interface LayoutConfig {
  components: {
    [componentId: string]: {
      id: string;
      type: 'button' | 'display' | 'indicator' | 'status';
      position: {
        x: number; // 0.0-1.0 normalized
        y: number; // 0.0-1.0 normalized
      };
      size: {
        width: number;  // 0.0-1.0 normalized
        height: number; // 0.0-1.0 normalized
      };
      properties?: {
        [key: string]: unknown;
      };
    };
  };
  version: string; // semantic version
  metadata?: {
    createdAt: string; // ISO timestamp
    createdBy?: string; // user ID or name
  };
}

/**
 * User's private layout record from database.
 */
export interface UserLayout {
  id: string;              // UUID
  userId: string;          // UUID
  layoutJson: LayoutConfig;
  isActive: boolean;
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
}

/**
 * Global layout record (active version).
 */
export interface GlobalLayout {
  id: string;              // UUID
  version: number;         // auto-increment integer
  layoutJson: LayoutConfig;
  publishedBy: string;     // user ID
  publishedAt: string;     // ISO timestamp
  changeNotes?: string;
  isActive: boolean;
  createdAt: string;       // ISO timestamp
}

/**
 * Global layout history record (archived version).
 */
export interface GlobalLayoutHistory {
  id: string;              // UUID
  layoutId?: string;       // original global_layouts.id
  version: number;
  layoutJson: LayoutConfig;
  publishedBy: string;     // user ID
  publishedAt: string;     // ISO timestamp
  changeNotes?: string;
  archivedAt: string;      // ISO timestamp
  archivedBy?: string;     // user ID who archived (e.g., admin who published new version)
}

/**
 * Layout status for UI display.
 */
export interface LayoutStatus {
  source: 'private' | 'global' | 'default';
  layout: LayoutConfig;
  metadata: {
    version?: number;        // global version number
    lastUpdated: string;     // ISO timestamp
    publishedBy?: string;    // admin name or ID
    versionLabel?: string;   // "v2.4"
  };
}

/**
 * User profile role.
 */
export type UserRole = 'player' | 'admin' | 'platform_designer';

/**
 * User profile with role.
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  // ... other profile fields
}
```

---

## 3. API Endpoints Design

### 3.1 Endpoint Specifications

```typescript
// src/app/api/layouts/

/**
 * GET /api/layouts/active
 * Resolves user's active layout (private > global > default)
 */
interface GetActiveLayoutRequest {}

interface GetActiveLayoutResponse {
  source: 'private' | 'global' | 'default';
  layout: LayoutConfig;
  metadata: {
    version?: number;
    lastUpdated: string;
    publishedBy?: string;
  };
}

// Handler logic:
// 1. Verify authentication
// 2. Query user_layouts WHERE user_id = auth.uid AND is_active = true
// 3. If found: Return { source: 'private', layout, metadata }
// 4. Else: Query global_layouts WHERE is_active = true
// 5. If found: Return { source: 'global', layout, version, lastUpdated }
// 6. Else: Return { source: 'default', layout: SYSTEM_DEFAULT }

---

/**
 * POST /api/layouts/user
 * Save or update user's private layout
 */
interface PostUserLayoutRequest {
  layout: LayoutConfig;
}

interface PostUserLayoutResponse {
  success: boolean;
  layoutId: string;
  message?: string;
}

// Handler logic:
// 1. Verify authentication
// 2. Validate layout JSON schema
// 3. Deactivate user's previous layouts (is_active = false)
// 4. Upsert new layout with is_active = true
// 5. Set updated_at = NOW()
// 6. Return { success: true, layoutId }

---

/**
 * DELETE /api/layouts/user
 * Delete user's private layout (reset to global)
 */
interface DeleteUserLayoutRequest {}

interface DeleteUserLayoutResponse {
  success: boolean;
  message?: string;
}

// Handler logic:
// 1. Verify authentication
// 2. Set is_active = false for user's active layout
// 3. (Or hard delete: DELETE WHERE user_id = auth.uid)
// 4. Return { success: true }

---

/**
 * POST /api/layouts/global
 * Publish new global layout (admin only)
 */
interface PostGlobalLayoutRequest {
  layout: LayoutConfig;
  changeNotes?: string;
}

interface PostGlobalLayoutResponse {
  success: boolean;
  version: number;
  layoutId: string;
  message?: string;
}

// Handler logic:
// 1. Verify authentication
// 2. Verify user has role 'admin' or 'platform_designer'
// 3. Validate layout JSON schema
// 4. Get current active global_layouts record
// 5. Archive current record to global_layout_history
// 6. Create new global_layouts record with:
//    - version = (MAX(version) + 1)
//    - is_active = true
//    - published_by = auth.uid
//    - published_at = NOW()
//    - change_notes = request.changeNotes
// 7. Return { success: true, version, layoutId }

---

/**
 * GET /api/layouts/global/history
 * Get global layout version history (admin only)
 */
interface GetGlobalHistoryRequest {}

interface GetGlobalHistoryResponse {
  versions: Array<{
    id: string;
    version: number;
    publishedBy: string;
    publishedAt: string;
    changeNotes?: string;
  }>;
}

// Handler logic:
// 1. Verify authentication
// 2. Verify user has admin role
// 3. SELECT * FROM global_layout_history
// 4. ORDER BY version DESC
// 5. LIMIT 100
// 6. Return { versions: [...] }

---

/**
 * POST /api/layouts/global/restore
 * Restore previous global layout version (admin only)
 */
interface PostGlobalRestoreRequest {
  versionId: string; // ID from global_layout_history
  changeNotes?: string;
}

interface PostGlobalRestoreResponse {
  success: boolean;
  newVersion: number;
  message?: string;
}

// Handler logic:
// 1. Verify authentication
// 2. Verify user has admin role
// 3. Get history record by versionId
// 4. Archive current active layout to history
// 5. Copy history record to global_layouts
// 6. Update new record with:
//    - version = (MAX(version) + 1)
//    - is_active = true
//    - published_by = auth.uid
//    - published_at = NOW()
//    - change_notes = `Restored v{old_version}` (or provided notes)
// 7. Return { success: true, newVersion }
```

---

## 4. Database Schema & Migrations

### 4.1 SQL Migration File

```sql
-- migrations/[timestamp]_create_layout_tables.sql

-- 1. Add role column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'player'
CHECK (role IN ('player', 'admin', 'platform_designer'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 2. Create user_layouts table
CREATE TABLE IF NOT EXISTS user_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  layout_json JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_layouts_user_id 
  ON user_layouts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_layouts_active 
  ON user_layouts(user_id, is_active);

-- 3. Create global_layouts table
CREATE TABLE IF NOT EXISTS global_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version INTEGER NOT NULL UNIQUE,
  layout_json JSONB NOT NULL,
  published_by UUID NOT NULL REFERENCES profiles(id),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  change_notes TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_global_layouts_active 
  ON global_layouts(is_active);
CREATE INDEX IF NOT EXISTS idx_global_layouts_version 
  ON global_layouts(version DESC);

-- 4. Create global_layout_history table
CREATE TABLE IF NOT EXISTS global_layout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_id UUID,
  version INTEGER NOT NULL,
  layout_json JSONB NOT NULL,
  published_by UUID NOT NULL REFERENCES profiles(id),
  published_at TIMESTAMPTZ NOT NULL,
  change_notes TEXT,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  archived_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_global_layout_history_version 
  ON global_layout_history(version DESC);
CREATE INDEX IF NOT EXISTS idx_global_layout_history_layout_id 
  ON global_layout_history(layout_id);

-- 5. Enable RLS if using Supabase
ALTER TABLE user_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_layout_history ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies
-- Users can only read/write their own layouts
CREATE POLICY "Users can read own layouts" ON user_layouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own layouts" ON user_layouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own layouts" ON user_layouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own layouts" ON user_layouts
  FOR DELETE USING (auth.uid() = user_id);

-- Global layouts are readable by all, but only admins can write
CREATE POLICY "Anyone can read global layouts" ON global_layouts
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert global layouts" ON global_layouts
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'platform_designer')
    )
  );

-- History is readable by admins, readonly
CREATE POLICY "Admins can read layout history" ON global_layout_history
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'platform_designer')
    )
  );
```

---

## 5. Component Architecture

### 5.1 New React Components

```typescript
// src/components/gameplay/GameplayLayoutSettings/

/**
 * Main settings page component.
 * Displays layout status and action buttons.
 */
export function GameplayLayoutSettings() {
  const [status, setStatus] = useState<LayoutStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userRole = user?.role || 'player';
  const isAdmin = userRole === 'admin' || userRole === 'platform_designer';

  useEffect(() => {
    loadLayoutStatus();
  }, []);

  async function loadLayoutStatus() {
    setLoading(true);
    try {
      const response = await fetch('/api/layouts/active');
      const data = await response.json();
      setStatus(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold">Gameplay Layout</h2>
      </div>

      {/* Status Display */}
      <StatusCard status={status} loading={loading} />

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link href="/profile/gameplay-layout/edit">
          <Button className="w-full" size="lg">
            Edit Gameplay Layout
          </Button>
        </Link>

        {isAdmin && (
          <Link href="/profile/gameplay-layout/edit-global">
            <Button className="w-full" variant="secondary" size="lg">
              Edit Global Layout
            </Button>
          </Link>
        )}

        <Button 
          className="w-full" 
          variant="destructive" 
          size="lg"
          onClick={() => setShowResetDialog(true)}
        >
          Reset to Default
        </Button>

        {isAdmin && (
          <Link href="/profile/gameplay-layout/history">
            <Button className="w-full" variant="outline" size="lg">
              View Version History
            </Button>
          </Link>
        )}
      </div>

      {/* Reset Confirmation Dialog */}
      <ResetConfirmationDialog 
        open={showResetDialog}
        onConfirm={handleReset}
        onCancel={() => setShowResetDialog(false)}
      />
    </div>
  );
}

---

/**
 * Status Card - displays current layout info.
 */
interface StatusCardProps {
  status: LayoutStatus | null;
  loading: boolean;
}

function StatusCard({ status, loading }: StatusCardProps) {
  if (loading) return <SkeletonCard />;
  if (!status) return <ErrorCard />;

  const sourceLabel = status.source === 'private' ? 'Private Layout' :
                      status.source === 'global' ? 'Global Layout' :
                      'System Default';

  return (
    <Card className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-phantom-muted uppercase font-bold">
          Current Active Layout
        </span>
        <Badge>{sourceLabel}</Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-phantom-muted">Source:</span>
          <span className="font-semibold">{sourceLabel}</span>
        </div>

        {status.metadata.version && (
          <div className="flex justify-between">
            <span className="text-phantom-muted">Version:</span>
            <span className="font-semibold">{status.metadata.versionLabel}</span>
          </div>
        )}

        {status.metadata.publishedBy && (
          <div className="flex justify-between">
            <span className="text-phantom-muted">Published by:</span>
            <span className="font-semibold">{status.metadata.publishedBy}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-phantom-muted">Last Updated:</span>
          <span className="font-semibold">
            {formatDistanceToNow(new Date(status.metadata.lastUpdated))} ago
          </span>
        </div>
      </div>
    </Card>
  );
}
```

### 5.2 Editor Wrapper Components


```typescript
// src/components/gameplay/LayoutEditorShell/

/**
 * Wraps HUDStudio editor with save/publish workflows.
 * Does NOT modify the editor itself.
 */
interface LayoutEditorShellProps {
  layoutType: 'private' | 'global'; // Determines save behavior
  initialLayout?: LayoutConfig;
  onSaved?: () => void;
}

export function LayoutEditorShell({
  layoutType,
  initialLayout,
  onSaved
}: LayoutEditorShellProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [layoutData, setLayoutData] = useState<LayoutConfig | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadLayout();
  }, [layoutType]);

  async function loadLayout() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/layouts/active');
      const status = await response.json();
      setLayoutData(status.layout);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <EditorSkeleton />;
  }

  return (
    <div className="flex flex-col h-screen bg-phantom-background">
      {/* Header */}
      <EditorHeader
        title={layoutType === 'private' ? 'Edit Gameplay Layout' : 'Edit Global Layout'}
        onSave={() => setShowSaveModal(true)}
        isSaving={isSaving}
      />

      {/* Editor Container */}
      <div className="flex-1 overflow-hidden">
        <HUDStudioProvider initialLayout={layoutData}>
          <HUDStudio />
        </HUDStudioProvider>
      </div>

      {/* Save Modal */}
      {layoutType === 'private' && (
        <SavePrivateLayoutModal
          open={showSaveModal}
          onConfirm={async () => {
            setIsSaving(true);
            try {
              await savePrivateLayout();
              onSaved?.();
              router.push('/profile?tab=overview');
            } finally {
              setIsSaving(false);
            }
          }}
          onCancel={() => setShowSaveModal(false)}
        />
      )}

      {layoutType === 'global' && (
        <PublishGlobalLayoutModal
          open={showSaveModal}
          onConfirm={async (changeNotes) => {
            setIsSaving(true);
            try {
              await publishGlobalLayout(changeNotes);
              onSaved?.();
              router.push('/profile?tab=overview');
            } finally {
              setIsSaving(false);
            }
          }}
          onCancel={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}

---

/**
 * Editor Header Component.
 */
interface EditorHeaderProps {
  title: string;
  onSave: () => void;
  isSaving: boolean;
}

function EditorHeader({ title, onSave, isSaving }: EditorHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between p-4 border-b border-phantom-border bg-phantom-surface">
      <button
        onClick={() => router.back()}
        className="p-2 hover:bg-phantom-surface/80 rounded-lg transition"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <h1 className="text-lg font-bold text-center flex-1">{title}</h1>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="px-6 py-2 bg-phantom-purple text-white rounded-lg font-semibold
          hover:bg-phantom-purple/90 disabled:opacity-50 transition"
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}

---

/**
 * Save Modal for Private Layouts.
 */
interface SavePrivateLayoutModalProps {
  open: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

function SavePrivateLayoutModal({
  open,
  onConfirm,
  onCancel
}: SavePrivateLayoutModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save layout');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Private Layout</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-phantom-muted">
            This layout will be saved to your account and used only in your gameplay.
            Other players will not be affected.
          </p>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Layout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

---

/**
 * Publish Modal for Global Layouts (admin only).
 */
interface PublishGlobalLayoutModalProps {
  open: boolean;
  onConfirm: (changeNotes: string) => Promise<void>;
  onCancel: () => void;
}

function PublishGlobalLayoutModal({
  open,
  onConfirm,
  onCancel
}: PublishGlobalLayoutModalProps) {
  const [changeNotes, setChangeNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm(changeNotes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish layout');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish as Global Layout</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-yellow-500/20 border border-yellow-500 rounded">
            <p className="text-sm text-yellow-400 font-semibold">
              ⚠️ This will become the default layout for all players without custom layouts.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Change Notes (optional)
            </label>
            <textarea
              value={changeNotes}
              onChange={(e) => setChangeNotes(e.target.value)}
              placeholder="e.g., 'Moved spin button to center, improved readability'"
              className="w-full p-3 bg-phantom-surface border border-phantom-border rounded-lg
                text-white text-sm resize-none"
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Publishing...' : 'Publish Layout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 5.3 Layout History Components

```typescript
// src/components/gameplay/GlobalLayoutHistory/

/**
 * Display global layout version history (admin only).
 */
export function GlobalLayoutHistory() {
  const [versions, setVersions] = useState<GlobalLayoutHistoryVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadVersions();
  }, []);

  async function loadVersions() {
    setLoading(true);
    try {
      const response = await fetch('/api/layouts/global/history');
      const data = await response.json();
      setVersions(data.versions);
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore(versionId: string) {
    setLoading(true);
    try {
      const response = await fetch('/api/layouts/global/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId })
      });
      if (response.ok) {
        toast.success('Layout restored');
        loadVersions();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-phantom-surface rounded-lg transition"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold">Version History</h2>
      </div>

      {loading ? (
        <SkeletonList />
      ) : versions.length === 0 ? (
        <Card className="p-6 text-center text-phantom-muted">
          No versions published yet
        </Card>
      ) : (
        <div className="space-y-2">
          {versions.map((version) => (
            <Card
              key={version.id}
              className="p-4 hover:bg-phantom-surface/80 transition cursor-pointer"
              onClick={() => setSelectedVersion(version.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-bold text-lg">{version.versionLabel}</p>
                  <p className="text-sm text-phantom-muted">
                    Published {formatDistanceToNow(new Date(version.publishedAt))} ago
                  </p>
                  <p className="text-sm text-phantom-muted">
                    by {version.publishedBy}
                  </p>
                  {version.changeNotes && (
                    <p className="text-sm mt-2 text-white">
                      {version.changeNotes}
                    </p>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVersion(version.id);
                    setShowRestoreDialog(true);
                  }}
                  className="px-4 py-2 bg-phantom-purple text-white rounded-lg
                    font-semibold hover:bg-phantom-purple/90 transition"
                >
                  Restore
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Restore Confirmation */}
      {selectedVersion && (
        <RestoreConfirmationDialog
          open={showRestoreDialog}
          version={versions.find((v) => v.id === selectedVersion)}
          onConfirm={() => {
            handleRestore(selectedVersion);
            setShowRestoreDialog(false);
          }}
          onCancel={() => setShowRestoreDialog(false)}
        />
      )}
    </div>
  );
}
```

### 5.4 Custom Hooks

```typescript
// src/lib/hooks/useLayoutEditor.ts

/**
 * Hook for managing layout editor state and operations.
 */
export function useLayoutEditor() {
  const [layout, setLayout] = useState<LayoutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function loadLayout(layoutType: 'private' | 'global') {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/layouts/active');
      if (!response.ok) throw new Error('Failed to load layout');
      const { layout } = await response.json();
      setLayout(layout);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  async function savePrivateLayout(layoutData: LayoutConfig) {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/layouts/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: layoutData })
      });
      if (!response.ok) throw new Error('Failed to save layout');
      const result = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  async function publishGlobalLayout(
    layoutData: LayoutConfig,
    changeNotes?: string
  ) {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/layouts/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout: layoutData, changeNotes })
      });
      if (!response.ok) throw new Error('Failed to publish layout');
      const result = await response.json();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish';
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  async function resetToGlobal() {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/layouts/user', {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to reset layout');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset';
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    layout,
    loading,
    error,
    isSaving,
    loadLayout,
    savePrivateLayout,
    publishGlobalLayout,
    resetToGlobal
  };
}

---

// src/lib/hooks/useUserRole.ts

/**
 * Hook for checking user role and permissions.
 */
export function useUserRole() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => setProfile(d.profile))
      .finally(() => setLoading(false));
  }, [user]);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'platform_designer';
  const canPublishGlobalLayout = isAdmin;
  const canViewHistory = isAdmin;

  return {
    profile,
    loading,
    isAdmin,
    canPublishGlobalLayout,
    canViewHistory,
    userRole: profile?.role || 'player'
  };
}
```

---

## 6. Layout Resolution Logic

### 6.1 Pseudocode for Active Layout Resolution

```typescript
// src/lib/layout/resolveActiveLayout.ts

/**
 * Resolves which layout to load for gameplay.
 * Priority: private > global > default
 */
export async function resolveActiveLayout(userId: string): Promise<LayoutStatus> {
  try {
    // 1. Check for user's active private layout
    const privateLayout = await db.query(`
      SELECT * FROM user_layouts
      WHERE user_id = $1 AND is_active = true
      LIMIT 1
    `, [userId]);

    if (privateLayout.rows.length > 0) {
      return {
        source: 'private',
        layout: privateLayout.rows[0].layout_json,
        metadata: {
          lastUpdated: privateLayout.rows[0].updated_at,
          timestamp: new Date().toISOString()
        }
      };
    }

    // 2. Fall back to active global layout
    const globalLayout = await db.query(`
      SELECT * FROM global_layouts
      WHERE is_active = true
      LIMIT 1
    `);

    if (globalLayout.rows.length > 0) {
      const record = globalLayout.rows[0];
      return {
        source: 'global',
        layout: record.layout_json,
        metadata: {
          version: record.version,
          versionLabel: `v${record.version}`,
          lastUpdated: record.published_at,
          publishedBy: record.published_by,
          timestamp: new Date().toISOString()
        }
      };
    }

    // 3. Fall back to system default
    return {
      source: 'default',
      layout: SYSTEM_DEFAULT_LAYOUT,
      metadata: {
        lastUpdated: new Date().toISOString(),
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Failed to resolve layout:', error);
    return {
      source: 'default',
      layout: SYSTEM_DEFAULT_LAYOUT,
      metadata: {
        lastUpdated: new Date().toISOString(),
        error: 'Failed to resolve user layout',
        timestamp: new Date().toISOString()
      }
    };
  }
}
```

---

## 7. Mobile & Telegram Mini App Optimization

### 7.1 Mobile Considerations

1. **Touch Targets**
   - All buttons minimum 44×44px
   - Spacing 8px minimum between interactive elements
   - No hover states on touch (use active/pressed states)

2. **Responsive Layout**
   - Single-column layout on mobile (<480px)
   - Full-width buttons and cards
   - Stack action buttons vertically
   - No multi-column grid on narrow viewports

3. **Editor Full-Screen Mode**
   - Hide all header/footer when editing
   - Show only essential controls (Back, Save)
   - Use viewport's full width/height
   - Touch-optimized drag/resize handles (larger than desktop)

4. **Keyboard Handling**
   - Dismiss keyboard on button taps
   - Use `autoComplete="off"` on text inputs
   - Handle soft keyboard appearance/disappearance

### 7.2 Telegram Mini App Integration

1. **WebView Considerations**
   - No external navigation (use internal links)
   - Use Telegram's back button API
   - Viewport units must account for safe areas
   - No horizontal scroll

2. **Back Navigation**
   ```typescript
   // Use Telegram's native back button if available
   if (typeof window !== 'undefined' && window.TelegramWebApp) {
     const twa = window.TelegramWebApp;
     twa.BackButton.onClick(() => {
       // Custom back handler
       router.back();
     });
     twa.BackButton.show();
   }
   ```

3. **Haptic Feedback** (optional)
   ```typescript
   // Provide haptic feedback on button taps
   function notifyHaptic() {
     if (window.TelegramWebApp?.HapticFeedback) {
       window.TelegramWebApp.HapticFeedback.impactOccurred('medium');
     }
   }
   ```

---

## 8. Security Implementation

### 8.1 Backend Permission Checks

Every endpoint that writes or reads sensitive data must verify permissions:

```typescript
// src/lib/middleware/requireAuth.ts

export async function requireAuth(request: NextRequest): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Unauthorized', { cause: 401 });
  }
  
  return user.id;
}

---

// src/lib/middleware/requireAdmin.ts

export async function requireAdmin(userId: string): Promise<boolean> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    throw new Error('Unauthorized', { cause: 403 });
  }

  if (profile.role !== 'admin' && profile.role !== 'platform_designer') {
    throw new Error('Forbidden: Admin role required', { cause: 403 });
  }

  return true;
}
```

### 8.2 Input Validation

```typescript
// src/lib/validation/layoutValidation.ts

import { z } from 'zod';

const ComponentSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['button', 'display', 'indicator', 'status']),
  position: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1)
  }),
  size: z.object({
    width: z.number().min(0).max(1),
    height: z.number().min(0).max(1)
  }),
  properties: z.record(z.unknown()).optional()
});

export const LayoutConfigSchema = z.object({
  components: z.record(ComponentSchema),
  version: z.string(),
  metadata: z.object({
    createdAt: z.string().datetime(),
    createdBy: z.string().optional()
  }).optional()
});

export function validateLayout(data: unknown): LayoutConfig {
  return LayoutConfigSchema.parse(data);
}
```

---

## 9. Error Handling & UX

### 9.1 Error States

All operations should handle and display errors gracefully:

```typescript
// Toast notifications
- Save success: "Layout saved successfully"
- Save error: "Failed to save layout. Please try again."
- Publish success: "Global layout published (v2.5)"
- Publish error: "Failed to publish. Check permissions."
- Reset success: "Reset to global layout"
- Reset error: "Failed to reset. Please try again."
- Network error: "Connection lost. Please check your internet."

// Dialog messages
- Permission denied: "You don't have permission to perform this action."
- Invalid layout: "Layout data is invalid. Please try again."
- Version conflict: "Layout was updated elsewhere. Please refresh."
```

### 9.2 Loading States

- Show spinner during data fetch
- Show skeleton during layout loading
- Disable buttons during save operations
- Show loading text on buttons ("Saving...")

---

## 10. File Structure

```
src/
├── app/
│   ├── (player)/
│   │   └── profile/
│   │       ├── page.tsx (updated - includes Gameplay Layout section)
│   │       └── gameplay-layout/
│   │           ├── page.tsx (settings page)
│   │           ├── edit/
│   │           │   └── page.tsx (private edit flow)
│   │           ├── edit-global/
│   │           │   └── page.tsx (global edit flow - admin only)
│   │           └── history/
│   │               └── page.tsx (version history - admin only)
│   │
│   └── api/
│       └── layouts/
│           ├── active/route.ts (GET)
│           ├── user/route.ts (POST, DELETE)
│           ├── global/route.ts (POST)
│           ├── global/
│           │   ├── history/route.ts (GET)
│           │   └── restore/route.ts (POST)
│           └── _lib/
│               ├── resolver.ts (resolve active layout)
│               ├── validator.ts (validate layout JSON)
│               └── permissions.ts (permission checks)
│
├── components/
│   └── gameplay/
│       ├── GameplayLayoutSettings/ (new)
│       │   ├── index.tsx
│       │   ├── StatusCard.tsx
│       │   └── ResetConfirmationDialog.tsx
│       ├── LayoutEditorShell/ (new)
│       │   ├── index.tsx
│       │   ├── EditorHeader.tsx
│       │   ├── SavePrivateLayoutModal.tsx
│       │   └── PublishGlobalLayoutModal.tsx
│       ├── GlobalLayoutHistory/ (new)
│       │   ├── index.tsx
│       │   └── RestoreConfirmationDialog.tsx
│       └── hud-studio/ (existing - DO NOT MODIFY)
│
├── lib/
│   ├── types/
│   │   └── layout.ts (new - type definitions)
│   ├── hooks/
│   │   ├── useLayoutEditor.ts (new)
│   │   └── useUserRole.ts (new)
│   ├── layout/
│   │   └── resolveActiveLayout.ts (new)
│   ├── validation/
│   │   └── layoutValidation.ts (new)
│   └── middleware/
│       ├── requireAuth.ts (new)
│       └── requireAdmin.ts (new)
│
└── migrations/
    └── [timestamp]_create_layout_tables.sql (new)
```

---

## 11. Testing Strategy

### 11.1 Unit Tests

- Layout resolution logic (all 3 priority cases)
- Permission checks (admin vs player)
- Input validation (valid/invalid layout JSON)
- Role detection from profile

### 11.2 Integration Tests

- Save private layout flow
- Publish global layout flow
- Reset to default flow
- Version history retrieval and restore

### 11.3 E2E Tests

- Standard player: Edit → Save → Verify in gameplay
- Admin: Edit global → Publish → Verify all players see update
- Admin: Restore previous version → Verify version incremented
- Permission enforcement (player cannot publish)

---

## 12. Migration Path & Rollout

### Phase 1: Backend Setup
- Create database tables
- Implement API endpoints with permission checks
- Add system default layout constant
- Deploy migration

### Phase 2: Frontend UI
- Build GameplayLayoutSettings component
- Build LayoutEditorShell wrapper
- Add routes for edit/history pages
- Integrate into Profile page

### Phase 3: Testing & Polish
- Run manual testing on mobile/Telegram
- Fix edge cases and error handling
- Performance optimization
- Accessibility review

### Phase 4: Rollout
- Gradual rollout to 10% → 50% → 100% users
- Monitor error rates and performance
- Gather user feedback
- Post-launch improvements

---

*Design Document Version: 1.0*  
*Status: Ready for Implementation*  
*Next: Create tasks.md with implementation breakdown*
