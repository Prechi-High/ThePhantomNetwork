# Gameplay Layout Access Control & Publishing - Requirements Document

## Executive Summary

This feature enables end-users to access the existing Gameplay Layout Editor from their mobile device (including Telegram Mini App), customize their personal HUD layout, and save changes as a Private Layout. Authorized administrators can additionally publish layouts as the Global Layout that applies to all players without private overrides. The system includes complete role-based access control, layout versioning, and a secure backend enforcement layer.

**Key Distinction:** This is NOT about modifying the HUD Studio editor itself. The HUD Studio remains unchanged. This feature adds production-ready access controls, user-facing UI, database persistence, and publishing workflows around the existing editor.

---

## 1. User Stories

### 1.1 Standard Player Stories

**US-1.1.1: Access Layout Editor from Profile**
- **As a** standard player
- **I want to** access the Gameplay Layout Editor from my Profile page
- **So that** I can customize my HUD without leaving the game flow

**US-1.1.2: Edit Personal Layout on Mobile**
- **As a** mobile player
- **I want to** edit my HUD layout using touch controls on my phone
- **So that** I can optimize my layout for my device and play style

**US-1.1.3: Save Private Layout**
- **As a** player
- **I want to** save my customized layout privately
- **So that** only my gameplay uses my personal configuration

**US-1.1.4: Reset to Global Default**
- **As a** player who dislikes their changes
- **I want to** reset back to the platform default layout
- **So that** I can start fresh without affecting anyone else

**US-1.1.5: View Layout Status**
- **As a** player
- **I want to** see whether I'm using a private or global layout
- **So that** I understand my current configuration

### 1.2 Administrator Stories

**US-1.2.1: Publish Global Layout**
- **As a** UI administrator
- **I want to** publish a new global layout for all players
- **So that** everyone benefits from improved HUD designs

**US-1.2.2: Version Control**
- **As a** platform designer
- **I want to** see all previous global layout versions
- **So that** I can restore a previous version if needed

**US-1.2.3: Test Before Publishing**
- **As an** administrator
- **I want to** save layouts privately before publishing
- **So that** I can test changes without affecting users

**US-1.2.4: Track Layout Changes**
- **As a** platform designer
- **I want to** see who published each version and when
- **So that** I can audit layout changes

### 1.3 Product Manager Stories

**US-1.3.1: User Empowerment**
- **As a** product manager
- **I want** players to customize their HUD freely
- **So that** we increase player satisfaction and retention

**US-1.3.2: Controlled Rollout**
- **As a** product manager
- **I want** administrators to control default layouts
- **So that** we maintain visual consistency while allowing personalization

---

## 2. Functional Requirements

### 2.1 Navigation & Entry Point

**FR-2.1.1: Profile Integration**
- Profile page MUST include a "Gameplay Layout" section
- Section MUST be accessible from bottom navigation → Profile
- Section MUST appear below primary profile information
- Section MUST be visible on mobile devices (390px+ width)

**FR-2.1.2: Navigation Flow**
Navigation sequence MUST be:
```
Profile
  ↓
Gameplay Layout (settings page)
  ↓
Edit Gameplay Layout / Edit Global Layout (button)
  ↓
Gameplay Layout Editor (full-screen edit mode)
  ↓
Save Private / Publish Global (action buttons)
  ↓
Return to Gameplay Layout (settings page)
```

**FR-2.1.3: Direct Editor Access Prohibited**
- Editor MUST NOT be accessible directly from gameplay
- Editor MUST NOT be accessible via URL navigation
- Editor MUST only be accessible through Profile → Gameplay Layout

### 2.2 Gameplay Layout Settings Page

**FR-2.2.1: Layout Status Display**
Page MUST display:
- **Current Active Layout** heading
- **Layout Source**: "Private Layout" or "Global Layout"
- **Last Updated**: Timestamp (e.g., "2 hours ago" or "Yesterday")
- For Global: **Version Number** (e.g., "Version 2.4")
- For Global: **Published By** (username/admin name)

**FR-2.2.2: Standard Player Actions**
Standard players MUST see:
- **"Edit Gameplay Layout"** button (primary action)
- **"Reset to Default"** button (secondary action, destructive style)
- Layout status information

**FR-2.2.3: Administrator Actions**
Administrators MUST see:
- **"Edit Gameplay Layout"** button (edits private layout)
- **"Edit Global Layout"** button (edits platform layout)
- **"Reset to Default"** button
- **"View Version History"** button/link
- Layout status information with admin metadata

**FR-2.2.4: Mobile Optimization**
- All buttons MUST be touch-friendly (minimum 44×44px)
- Text MUST be readable at 14px+ size
- Layout MUST be single-column on mobile
- Spacing MUST prevent accidental taps

### 2.3 Opening the Editor

**FR-2.3.1: Edit Gameplay Layout (Standard Player)**
When tapped:
1. System MUST check if user has existing private layout
2. **If private layout exists**: Load private layout into editor
3. **If no private layout**: Load current active global layout
4. Launch editor in full-screen mode
5. Set editor mode to "Private Edit Mode"

**FR-2.3.2: Edit Gameplay Layout (Administrator)**
When administrator taps "Edit Gameplay Layout":
- Behavior MUST be identical to standard player
- Edits their personal private layout only
- Does NOT affect global layout

**FR-2.3.3: Edit Global Layout (Administrator Only)**
When administrator taps "Edit Global Layout":
1. System MUST verify administrator permission (backend check)
2. Load current active global layout
3. Launch editor in full-screen mode
4. Set editor mode to "Global Edit Mode"
5. Show clear indicator that editing affects all users

**FR-2.3.4: Editor Launch Behavior**
- Editor MUST open as full-screen overlay
- Editor MUST hide bottom navigation
- Editor MUST show "Back" or "Cancel" button
- Editor MUST load layout data before showing edit controls
- Loading state MUST show spinner/skeleton

### 2.4 Role-Based Access Control

**FR-2.4.1: Standard Player Permissions**
Standard players CAN:
- Open Gameplay Layout Editor
- Edit layout (drag, resize, property changes)
- Save Private Layout
- Delete Private Layout
- Reset to Global Layout
- View their layout status

Standard players CANNOT:
- Edit Global Layout
- Publish Global Layout
- Access global layout edit mode
- View global layout version history (read-only access only)
- Restore previous global versions

**FR-2.4.2: Administrator Permissions**
Administrators CAN:
- Everything Standard Players can do
- Open Global Layout Editor
- Edit Global Layout
- Publish Global Layout
- View global layout version history
- Restore previous global versions
- See who published each version

**FR-2.4.3: Permission Enforcement**
- Backend MUST verify permissions on EVERY save request
- Frontend MUST hide unauthorized UI elements
- API endpoints MUST reject unauthorized requests with 403 status
- No client-side permission checks MUST be trusted
- Permission checks MUST query user role from database

**FR-2.4.4: Role Definition**
System MUST recognize roles:
- **Standard Player**: Default role for all users (role: "player")
- **Administrator**: Users with role: "admin" or "platform_designer"
- Role MUST be stored in `profiles.role` column
- Role changes MUST require database migration or admin panel

### 2.5 Saving Layouts

**FR-2.5.1: Save Private Layout (Standard Player)**
When player saves in Private Edit Mode:
1. System MUST serialize current editor state to JSON
2. System MUST validate JSON structure
3. System MUST call `POST /api/layouts/user` with layout data
4. Backend MUST:
   - Verify user is authenticated
   - Upsert to `user_layouts` table
   - Set `is_active = true` for this layout
   - Set `is_active = false` for user's other layouts
   - Set `updated_at = NOW()`
5. Return success response
6. Close editor
7. Return to Gameplay Layout page
8. Show success toast: "Private layout saved"

**FR-2.5.2: Save Private Layout (Administrator)**
When administrator saves in Private Edit Mode:
- Behavior MUST be identical to standard player
- Edits MUST only affect administrator's personal layout
- Global layout MUST NOT be modified

**FR-2.5.3: Publish Global Layout (Administrator Only)**
When administrator saves in Global Edit Mode:
1. Show confirmation dialog:
   - "Publish as Global Layout?"
   - "This will become the default layout for all players without custom layouts."
   - "Previous version will be archived."
   - Input field: "Change Notes (optional)"
   - Buttons: "Cancel" | "Publish"
2. If confirmed:
   - System MUST serialize current editor state to JSON
   - System MUST validate JSON structure
   - System MUST call `POST /api/layouts/global` with layout data + notes
   - Backend MUST:
     - Verify user has administrator role
     - Create new global layout version
     - Archive current active global layout (move to history table)
     - Set new layout as `is_active = true`
     - Store `published_by` (user_id)
     - Store `published_at` (timestamp)
     - Store `change_notes` (optional text)
     - Generate new version number (auto-increment)
   - Return success response
3. Close editor
4. Return to Gameplay Layout page
5. Show success toast: "Global layout published (v2.5)"

**FR-2.5.4: Cancel Editing**
Cancel button MUST:
- Show confirmation if changes detected: "Discard changes?"
- If confirmed: Close editor without saving
- If no changes: Close editor immediately
- Return to Gameplay Layout page

### 2.6 Active Layout Resolution

**FR-2.6.1: Resolution Order**
When gameplay starts, system MUST resolve layout in this order:
```
1. Check if user has active private layout (user_layouts.is_active = true)
   ↓ IF EXISTS
   → Load Private Layout

2. ELSE: Load active global layout (global_layouts.is_active = true)
   ↓ IF EXISTS
   → Load Global Layout

3. ELSE: Load system default (hardcoded fallback)
   → Load System Default Layout
```

**FR-2.6.2: Resolution API**
Endpoint: `GET /api/layouts/active`
- Authenticated endpoint
- Returns: `{ source: "private" | "global" | "default", layout: {...}, metadata: {...} }`
- Metadata includes: version, last_updated, published_by (if global)

**FR-2.6.3: Caching Strategy**
- Client MUST cache resolved layout in memory during gameplay
- Client MUST refetch on app restart
- Client MUST refetch after saving layout
- Backend MUST set appropriate cache headers

### 2.7 Reset to Default

**FR-2.7.1: Reset Action**
"Reset to Default" button MUST:
1. Show confirmation dialog:
   - "Reset to Default Layout?"
   - "Your custom layout will be deleted."
   - "You will use the current global layout."
   - Buttons: "Cancel" | "Reset"
2. If confirmed:
   - Call `DELETE /api/layouts/user`
   - Backend MUST:
     - Verify user is authenticated
     - Set `is_active = false` for user's layout (soft delete)
     - OR: Hard delete from `user_layouts` table
   - Return success response
3. Refresh Gameplay Layout page
4. Show toast: "Reset to global layout"
5. Layout status MUST now show "Global Layout"

**FR-2.7.2: Reset Behavior**
- Reset MUST NOT affect global layout
- Reset MUST NOT affect other users
- Reset MUST be reversible if soft-delete approach used
- After reset, gameplay MUST use current global layout

### 2.8 Layout Versioning (Global Only)

**FR-2.8.1: Version Number Generation**
- Each published global layout MUST have unique version number
- Version MUST auto-increment (e.g., 1, 2, 3...)
- Version MUST be human-readable (e.g., "v2.4")
- Version MUST be stored in `global_layouts.version`

**FR-2.8.2: Version History Storage**
When publishing new global layout:
- Current active layout MUST be moved to `global_layout_history` table
- History record MUST include:
  - Original layout ID
  - Version number
  - Layout JSON
  - Published by (user_id)
  - Published at (timestamp)
  - Change notes
- Active layout table MUST only contain current version

**FR-2.8.3: View Version History**
Administrators MUST be able to:
- View list of all previous versions
- See version number, published date, published by
- Read change notes for each version
- Preview layout (read-only)

**FR-2.8.4: Restore Previous Version**
Administrators MUST be able to:
1. Select previous version from history
2. Click "Restore This Version"
3. System shows confirmation:
   - "Restore v2.3 as current global layout?"
   - "Current version will be archived."
   - Input field: "Change Notes (optional)"
   - Buttons: "Cancel" | "Restore"
4. If confirmed:
   - Archive current active layout
   - Copy selected history record to active global layout
   - Generate new version number
   - Store restore action in history
5. Show toast: "Restored v2.3 as v2.6"

### 2.9 Database Schema

**FR-2.9.1: user_layouts Table**
```sql
CREATE TABLE user_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  layout_json JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_layouts_user_id ON user_layouts(user_id);
CREATE INDEX idx_user_layouts_active ON user_layouts(user_id, is_active);
```

**FR-2.9.2: global_layouts Table**
```sql
CREATE TABLE global_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version INTEGER NOT NULL UNIQUE,
  layout_json JSONB NOT NULL,
  published_by UUID NOT NULL REFERENCES profiles(id),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  change_notes TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_global_layouts_active ON global_layouts(is_active);
CREATE INDEX idx_global_layouts_version ON global_layouts(version DESC);
```

**FR-2.9.3: global_layout_history Table**
```sql
CREATE TABLE global_layout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_id UUID NOT NULL, -- Original global_layouts.id
  version INTEGER NOT NULL,
  layout_json JSONB NOT NULL,
  published_by UUID NOT NULL REFERENCES profiles(id),
  published_at TIMESTAMPTZ NOT NULL,
  change_notes TEXT,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  archived_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_global_layout_history_version ON global_layout_history(version DESC);
CREATE INDEX idx_global_layout_history_layout_id ON global_layout_history(layout_id);
```

**FR-2.9.4: profiles Table Addition**
Add role column to existing profiles table:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'player';
-- role values: 'player', 'admin', 'platform_designer'
CREATE INDEX idx_profiles_role ON profiles(role);
```

### 2.10 API Endpoints

**FR-2.10.1: GET /api/layouts/active**
- **Auth**: Required
- **Description**: Get user's active layout (private or global)
- **Response**:
```json
{
  "source": "private" | "global" | "default",
  "layout": { /* layout JSON */ },
  "metadata": {
    "version": 2,
    "lastUpdated": "2025-01-15T10:30:00Z",
    "publishedBy": "admin_username" // if global
  }
}
```

**FR-2.10.2: POST /api/layouts/user**
- **Auth**: Required
- **Description**: Save/update user's private layout
- **Body**: `{ layout: { /* layout JSON */ } }`
- **Logic**:
  - Validate layout JSON structure
  - Upsert user_layouts (user_id + layout_json)
  - Set is_active = true
  - Deactivate other user layouts
- **Response**: `{ success: true, layoutId: "uuid" }`

**FR-2.10.3: DELETE /api/layouts/user**
- **Auth**: Required
- **Description**: Delete user's private layout (reset to global)
- **Logic**:
  - Set is_active = false (soft delete) OR hard delete
  - User will now use global layout
- **Response**: `{ success: true }`

**FR-2.10.4: POST /api/layouts/global**
- **Auth**: Required (admin role only)
- **Description**: Publish new global layout
- **Body**: `{ layout: { /* layout JSON */ }, changeNotes: "string" }`
- **Logic**:
  - Verify user has admin role (403 if not)
  - Archive current active global layout to history
  - Create new global layout record
  - Set is_active = true
  - Auto-increment version number
  - Store published_by, published_at, change_notes
- **Response**: `{ success: true, version: 3, layoutId: "uuid" }`

**FR-2.10.5: GET /api/layouts/global/history**
- **Auth**: Required (admin role only)
- **Description**: Get global layout version history
- **Response**:
```json
{
  "versions": [
    {
      "id": "uuid",
      "version": 2,
      "publishedBy": "username",
      "publishedAt": "2025-01-14T10:00:00Z",
      "changeNotes": "Moved spin button to center"
    }
  ]
}
```

**FR-2.10.6: POST /api/layouts/global/restore**
- **Auth**: Required (admin role only)
- **Description**: Restore previous global layout version
- **Body**: `{ versionId: "uuid", changeNotes: "string" }`
- **Logic**:
  - Verify user has admin role
  - Archive current active layout
  - Copy history record to active global layout
  - Generate new version number
- **Response**: `{ success: true, newVersion: 4 }`

### 2.11 Mobile Experience

**FR-2.11.1: Touch Optimization**
- All buttons MUST be minimum 44×44px touch targets
- Buttons MUST have 8px minimum spacing
- Primary actions MUST be in thumb-reachable zone (bottom 60% of screen)
- Destructive actions (Reset) MUST have secondary style

**FR-2.11.2: Telegram Mini App Support**
- All navigation MUST work in Telegram WebView
- Editor MUST work with touch events only
- No desktop-specific interactions allowed
- Back button MUST integrate with Telegram's back button API

**FR-2.11.3: Responsive Layout**
Page MUST adapt to screen sizes:
- 360px-430px: Single column, stacked buttons
- 431px-768px: Single column, wider buttons
- 769px+: Optional two-column layout

**FR-2.11.4: Editor Full-Screen Mode**
When editor opens:
- MUST hide bottom navigation
- MUST hide top header (if any)
- MUST show "Back" button in top-left
- MUST show "Save" button in top-right
- MUST use entire viewport for editing canvas

**FR-2.11.5: Performance**
- Layout loading MUST complete within 1 second
- Editor launch MUST complete within 2 seconds
- Touch interactions MUST respond within 100ms
- No layout shifts during loading

### 2.12 Security

**FR-2.12.1: Backend Permission Enforcement**
- Every save/publish endpoint MUST verify user authentication
- Global layout endpoints MUST verify admin role from database
- NO client-side permission checks MUST be trusted
- Permission violations MUST return 403 Forbidden

**FR-2.12.2: Input Validation**
Backend MUST validate:
- Layout JSON structure (required fields present)
- Layout JSON size (maximum 1MB)
- Component positions (0.0-1.0 normalized values)
- User owns the layout being modified (for private layouts)

**FR-2.12.3: SQL Injection Prevention**
- All queries MUST use parameterized statements
- No raw SQL with user input
- Use Supabase client's query builder

**FR-2.12.4: Authorization Checks**
```typescript
// Example backend authorization
async function requireAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (data?.role !== 'admin' && data?.role !== 'platform_designer') {
    throw new Error('Unauthorized: Admin role required');
  }
  return true;
}
```

---

## 3. Non-Functional Requirements

### 3.1 Performance

**NFR-3.1.1: API Response Times**
- Layout fetch: < 500ms (p95)
- Layout save: < 1000ms (p95)
- Layout list: < 500ms (p95)

**NFR-3.1.2: Editor Launch Time**
- Cold start: < 2 seconds
- Warm start: < 1 second
- Layout parsing: < 200ms

**NFR-3.1.3: Database Performance**
- Layout queries MUST use indexes
- Active layout query MUST be single-row lookup
- History queries MUST limit to 100 most recent versions

### 3.2 Reliability

**NFR-3.2.1: Data Integrity**
- Layout saves MUST be atomic (all-or-nothing)
- Version increments MUST be sequential with no gaps
- Active layout MUST always exist (global)

**NFR-3.2.2: Failure Handling**
- Failed saves MUST show clear error message
- Failed saves MUST NOT corrupt existing layout
- Network errors MUST allow retry
- Partial saves MUST rollback

**NFR-3.2.3: Backup Strategy**
- Global layout changes MUST be reversible
- History MUST preserve all published versions
- No automatic deletion of history records

### 3.3 Usability

**NFR-3.3.1: Error Messages**
- Errors MUST be user-friendly
- Errors MUST suggest corrective action
- Permission errors MUST be clear: "You don't have permission to publish global layouts"

**NFR-3.3.2: Confirmation Dialogs**
Required for:
- Publishing global layout
- Resetting to default
- Restoring previous version
- Discarding unsaved changes

**NFR-3.3.3: Loading States**
- Show spinner during save/publish
- Show skeleton during layout loading
- Disable buttons during async operations

### 3.4 Accessibility

**NFR-3.4.1: Screen Reader Support**
- All buttons MUST have aria-labels
- Layout status MUST be announced
- Confirmation dialogs MUST be announced

**NFR-3.4.2: Keyboard Navigation**
- All actions MUST be keyboard accessible (on desktop)
- Tab order MUST be logical
- Focus indicators MUST be visible

### 3.5 Scalability

**NFR-3.5.1: User Growth**
- System MUST support 100,000+ users with private layouts
- Database queries MUST remain performant at scale
- Indexes MUST optimize common queries

**NFR-3.5.2: Version History**
- System MUST support 1000+ global layout versions
- History queries MUST paginate (50 per page)
- Old versions MAY be archived after 1 year (retention policy)

---

## 4. Constraints

### 4.1 Technical Constraints

**C-4.1.1: Editor Integration**
- MUST use existing HUD Studio editor (no modifications to editor core)
- MUST only add routing, access control, and save workflows
- MUST pass layout data via props/context to editor

**C-4.1.2: Database**
- MUST use existing Supabase PostgreSQL database
- MUST integrate with existing `profiles` table
- MUST use existing authentication system

**C-4.1.3: Mobile Framework**
- MUST work in existing Next.js App Router structure
- MUST use existing component library
- MUST support Telegram Mini App WebView

### 4.2 Business Constraints

**C-4.2.1: User Experience**
- MUST NOT disrupt existing gameplay flow
- Layout changes MUST be opt-in (players can use global layout)
- Global layout updates MUST NOT force users to re-customize

**C-4.2.2: Administrator Access**
- Only designated administrators can publish global layouts
- Standard users MUST NOT accidentally publish global layouts
- Role changes MUST be manual (no self-service role elevation)

---

## 5. Acceptance Criteria

### 5.1 Standard Player Flow

**AC-5.1.1: Access Editor**
- [ ] Player navigates to Profile → Gameplay Layout
- [ ] Player sees current layout status (Global or Private)
- [ ] Player taps "Edit Gameplay Layout"
- [ ] Editor opens in full-screen mode
- [ ] Editor loads player's private layout OR current global layout

**AC-5.1.2: Edit and Save Private Layout**
- [ ] Player can drag, resize, and modify components
- [ ] Player taps "Save Private Layout"
- [ ] System saves layout to database
- [ ] Editor closes and returns to Gameplay Layout page
- [ ] Status now shows "Private Layout"
- [ ] Next gameplay session uses private layout

**AC-5.1.3: Reset to Default**
- [ ] Player taps "Reset to Default"
- [ ] System shows confirmation dialog
- [ ] Player confirms reset
- [ ] Private layout is deleted
- [ ] Status shows "Global Layout"
- [ ] Next gameplay session uses global layout

### 5.2 Administrator Flow

**AC-5.2.1: Edit Private Layout**
- [ ] Administrator sees both "Edit Gameplay Layout" and "Edit Global Layout" buttons
- [ ] Administrator taps "Edit Gameplay Layout"
- [ ] System loads administrator's private layout
- [ ] Administrator edits and saves
- [ ] Only administrator's gameplay is affected

**AC-5.2.2: Publish Global Layout**
- [ ] Administrator taps "Edit Global Layout"
- [ ] System loads current global layout
- [ ] Administrator makes changes
- [ ] Administrator taps "Publish as Global Layout"
- [ ] System shows confirmation with change notes input
- [ ] Administrator confirms
- [ ] System creates new global version
- [ ] All players without private layouts see new layout in next session

**AC-5.2.3: View and Restore Version History**
- [ ] Administrator taps "View Version History"
- [ ] System shows list of all previous versions
- [ ] Administrator selects version v2.3
- [ ] Administrator taps "Restore This Version"
- [ ] System shows confirmation
- [ ] Administrator confirms
- [ ] System publishes v2.3 as new active version (e.g., v2.6)

### 5.3 Security

**AC-5.3.1: Permission Enforcement**
- [ ] Standard player cannot access "Edit Global Layout" (button hidden)
- [ ] Standard player cannot POST to `/api/layouts/global` (returns 403)
- [ ] Standard player cannot view version history endpoint (returns 403)
- [ ] Administrator can access all global layout features

**AC-5.3.2: Data Isolation**
- [ ] User A's private layout does not affect User B
- [ ] Global layout updates do not overwrite private layouts
- [ ] Deleting private layout does not delete global layout

### 5.4 Mobile Experience

**AC-5.4.1: Touch Interactions**
- [ ] All buttons are easily tappable on mobile (44×44px minimum)
- [ ] Editor works with touch drag/resize
- [ ] No accidental taps due to small hit areas
- [ ] Confirmation dialogs are touch-friendly

**AC-5.4.2: Telegram Mini App**
- [ ] Feature works inside Telegram WebView
- [ ] Editor opens and closes correctly
- [ ] Back button integrates with Telegram back navigation
- [ ] No desktop-only features break on mobile

---

## 6. Glossary

- **Private Layout**: User-specific HUD layout stored in `user_layouts` table
- **Global Layout**: Platform-wide default HUD layout in `global_layouts` table
- **Active Layout**: The layout currently used by a player (private or global)
- **Layout Resolution**: Logic determining which layout to load for gameplay
- **Version**: Sequential number identifying each published global layout
- **History**: Archive of previous global layout versions
- **Restore**: Action to revert global layout to a previous version
- **Publish**: Action to make a layout the active global layout
- **Reset**: Action to delete private layout and revert to global

---

## 7. Dependencies

### 7.1 Internal Dependencies
- Existing HUD Studio editor (Phase 4-6 complete)
- Existing Profile page
- Existing authentication system
- Existing Supabase database

### 7.2 External Dependencies
- Supabase PostgreSQL (already in use)
- Next.js App Router (already in use)
- Telegram Mini App SDK (for Telegram integration)

### 7.3 Future Dependencies
- Analytics tracking for layout usage (optional)
- A/B testing framework for global layouts (optional)

---

## 8. Open Questions

1. **Q**: Should we track analytics on which components users move most?
   **Decision Needed**: Phase 1 = No analytics, Phase 2 = Usage tracking

2. **Q**: Should administrators be able to force-apply global layouts (override all private layouts)?
   **Decision Needed**: Phase 1 = No force-apply, Phase 2 = Optional override mechanism

3. **Q**: Should we limit how many private layouts a user can save?
   **Decision Needed**: Phase 1 = One active layout per user, Phase 2 = Multiple saved presets

4. **Q**: Should we allow users to share their private layouts with others?
   **Decision Needed**: Phase 1 = No sharing, Phase 2 = Community layout marketplace

5. **Q**: Should global layout publish trigger a notification to all online players?
   **Decision Needed**: Phase 1 = Silent update (applies on next session), Phase 2 = Optional push notification

---

## 9. Success Metrics

- **Adoption Rate**: % of users who create private layouts within 30 days
- **Retention Impact**: Compare retention of users with custom layouts vs default
- **Reset Rate**: % of users who reset to default (indicates dissatisfaction)
- **Global Layout Stability**: Number of global layout versions published per month (target: 2-4)
- **Error Rate**: < 0.1% of layout save operations fail
- **Mobile Usage**: % of layout edits performed on mobile devices (target: 70%+)

---

*Document Version: 1.0*  
*Last Updated: 2026-07-06*  
*Status: Ready for Design Phase*
