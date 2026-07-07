# Gameplay Layout Access Control - Implementation Tasks

## Task Dependency Graph

```
[TASK 1: Database Migration]
         ↓
[TASK 2: API Routes - Base Structure]
         ↓
    ┌────┴────┬────────────┬──────────────┐
    ↓         ↓            ↓              ↓
[T3.1]    [T3.2]       [T3.3]        [T3.4]
GET       POST         DELETE        POST
/active   /user        /user         /global
    ↓         ↓            ↓              ↓
    └────┬────┴────┬───────┘              ↓
         ↓         ↓                      ↓
    [TASK 4: Global API Routes]          ↓
    (history + restore)                  ↓
         ↓                                ↓
         └─────────────┬──────────────────┘
                       ↓
              [TASK 5: Type Definitions]
                       ↓
              [TASK 6: UI Components]
         ┌────────────┬────────────┐
         ↓            ↓            ↓
      Settings     Editor      History
      Components  Wrapper    Components
         ↓            ↓            ↓
         └────────────┴────────────┘
                       ↓
              [TASK 7: Routes & Pages]
         ┌────────────┬────────────┐
         ↓            ↓            ↓
    Settings      Private Edit  Global Edit
    Page          Page          Page
                                 ↓
                          (Admin only)
                                 ↓
                          [TASK 8: Role Guards]
                          (Middleware)
                       ↓
              [TASK 9: Integration Tests]
         ↓
[TASK 10: Mobile/Telegram Optimization]
         ↓
[TASK 11: Error Handling & Polish]
         ↓
[TASK 12: Documentation & Rollout]
```

---

## Task Specifications

### TASK 1: Database Migration

**Objective**: Create all necessary database tables and schema

**Subtasks**:
- [ ] Create migration file: `[timestamp]_create_layout_tables.sql`
- [ ] Add role column to profiles table (DEFAULT 'player', CHECK constraint)
- [ ] Create user_layouts table with indexes
- [ ] Create global_layouts table with version auto-increment
- [ ] Create global_layout_history table with archived versions
- [ ] Implement RLS policies for all tables
- [ ] Test migration on staging database

**Success Criteria**:
- ✅ All tables created in Supabase
- ✅ Indexes created for performance
- ✅ RLS policies allow appropriate access
- ✅ Role values exist in profiles table
- ✅ Foreign key constraints prevent orphaned records
- ✅ Migration is reversible

**Duration Estimate**: 2 hours

---

### TASK 2: API Routes - Base Structure & Utilities

**Objective**: Create shared utilities and base middleware for API routes

**Subtasks**:
- [ ] Create `src/lib/middleware/requireAuth.ts` - authentication check
- [ ] Create `src/lib/middleware/requireAdmin.ts` - admin permission check
- [ ] Create `src/lib/validation/layoutValidation.ts` - Zod schema for LayoutConfig
- [ ] Create `src/lib/layout/resolveActiveLayout.ts` - resolution logic
- [ ] Create `src/lib/types/layout.ts` - TypeScript type definitions
- [ ] Create response helpers for API routes (success, error)
- [ ] Create error handling utilities

**Success Criteria**:
- ✅ Middleware functions work correctly
- ✅ Validation rejects invalid layouts
- ✅ Resolution logic handles all 3 priority cases
- ✅ Type definitions match database schema
- ✅ Response helpers are consistent

**Duration Estimate**: 3 hours

**Depends On**: TASK 1

---

### TASK 3.1: API Route - GET /api/layouts/active

**Objective**: Implement endpoint to resolve and return user's active layout

**Subtasks**:
- [ ] Create `src/app/api/layouts/active/route.ts`
- [ ] Implement GET handler with auth check
- [ ] Call resolveActiveLayout() utility
- [ ] Return LayoutStatus response
- [ ] Add error handling
- [ ] Test with cURL/Postman

**Success Criteria**:
- ✅ Returns private layout if user has active private layout
- ✅ Returns global layout if no private layout
- ✅ Returns system default if neither exists
- ✅ Response includes metadata (version, lastUpdated, publishedBy)
- ✅ Unauthenticated requests return 401
- ✅ Response time < 500ms

**Duration Estimate**: 2 hours

**Depends On**: TASK 2

---

### TASK 3.2: API Route - POST /api/layouts/user

**Objective**: Implement endpoint to save user's private layout

**Subtasks**:
- [ ] Create `src/app/api/layouts/user/route.ts`
- [ ] Implement POST handler with auth check
- [ ] Validate layout JSON using Zod schema
- [ ] Deactivate user's previous layouts
- [ ] Insert/upsert new layout with is_active = true
- [ ] Set updated_at = NOW()
- [ ] Return success response with layoutId
- [ ] Handle validation errors
- [ ] Test save operation

**Success Criteria**:
- ✅ Saves valid layout to user_layouts table
- ✅ Only one active layout per user
- ✅ Previous layouts are deactivated
- ✅ Invalid layouts rejected with 400
- ✅ Unauthenticated requests rejected with 401
- ✅ Response includes layoutId for verification

**Duration Estimate**: 2 hours

**Depends On**: TASK 2

---

### TASK 3.3: API Route - DELETE /api/layouts/user

**Objective**: Implement endpoint to delete user's private layout (reset to global)

**Subtasks**:
- [ ] Create DELETE handler in `src/app/api/layouts/user/route.ts`
- [ ] Verify authentication
- [ ] Set is_active = false for user's active layout (soft delete)
- [ ] OR hard delete the layout record
- [ ] Return success response
- [ ] Add error handling for non-existent layouts
- [ ] Test reset operation

**Success Criteria**:
- ✅ Deactivates user's private layout
- ✅ User will now use global layout
- ✅ Does not affect other users
- ✅ Does not delete global layout
- ✅ Idempotent (safe to call multiple times)
- ✅ Returns 204 or 200 with success message

**Duration Estimate**: 1.5 hours

**Depends On**: TASK 2

---

### TASK 3.4: API Route - POST /api/layouts/global

**Objective**: Implement endpoint to publish new global layout (admin only)

**Subtasks**:
- [ ] Create `src/app/api/layouts/global/route.ts`
- [ ] Implement POST handler with auth + admin checks
- [ ] Validate layout JSON
- [ ] Get current active global_layouts record
- [ ] Archive current record to global_layout_history
- [ ] Create new global_layouts record with:
  - version = MAX(version) + 1
  - is_active = true
  - published_by = auth.uid
  - published_at = NOW()
  - change_notes = request body
- [ ] Return success response with version number
- [ ] Handle permission denied (403)
- [ ] Test publish operation

**Success Criteria**:
- ✅ Only admins can publish (403 for non-admins)
- ✅ New version has sequential number
- ✅ Previous version is archived
- ✅ New version marked as active
- ✅ Metadata (publishedBy, publishedAt, changeNotes) stored
- ✅ Response includes new version number
- ✅ Global layout applies to all players on next load

**Duration Estimate**: 3 hours

**Depends On**: TASK 2

---

### TASK 4: API Routes - Global History & Restore

**Objective**: Implement endpoints for viewing and restoring layout versions

**Subtasks**:
- [ ] Create `src/app/api/layouts/global/history/route.ts` (GET)
- [ ] Implement GET handler with admin check
- [ ] Query global_layout_history ordered by version DESC
- [ ] LIMIT 100 most recent versions
- [ ] Return version metadata (id, version, publishedBy, publishedAt, changeNotes)
- [ ] Create `src/app/api/layouts/global/restore/route.ts` (POST)
- [ ] Implement POST handler with admin check
- [ ] Validate versionId parameter
- [ ] Archive current active layout
- [ ] Copy selected history record to active global_layouts
- [ ] Generate new version number
- [ ] Store restore action with change notes
- [ ] Return success response with newVersion
- [ ] Handle invalid versionId (404)
- [ ] Test history retrieval and restore

**Success Criteria**:
- ✅ GET /history returns all previous versions (newest first)
- ✅ Response includes version metadata
- ✅ Only admins can access (403 for non-admins)
- ✅ POST /restore archives current version
- ✅ POST /restore restores selected version
- ✅ Restored version gets new sequential number
- ✅ Change notes tracked for all versions
- ✅ Restore is atomic (all-or-nothing)

**Duration Estimate**: 3 hours

**Depends On**: TASK 3.4

---

### TASK 5: Type Definitions & Hooks

**Objective**: Create TypeScript types and custom React hooks

**Subtasks**:
- [ ] Create `src/lib/types/layout.ts` with all layout-related types
- [ ] Create `src/lib/hooks/useLayoutEditor.ts` hook
  - loadLayout()
  - savePrivateLayout()
  - publishGlobalLayout()
  - resetToGlobal()
  - error/loading/isSaving state
- [ ] Create `src/lib/hooks/useUserRole.ts` hook
  - Load user profile with role
  - isAdmin flag
  - canPublishGlobalLayout flag
  - canViewHistory flag
- [ ] Add error handling to hooks
- [ ] Add TypeScript strict checks

**Success Criteria**:
- ✅ All types exported from layout.ts
- ✅ Hooks handle loading/error states
- ✅ Hooks manage API calls
- ✅ useUserRole caches profile data
- ✅ No TypeScript errors
- ✅ Types match database schema

**Duration Estimate**: 2 hours

**Depends On**: TASK 2

---

### TASK 6: UI Components

**Objective**: Build all React components for the feature

**Subtasks**:

**6.1: GameplayLayoutSettings Component**
- [ ] Create `src/components/gameplay/GameplayLayoutSettings/index.tsx`
- [ ] Create `StatusCard.tsx` (displays current layout info)
- [ ] Create `ResetConfirmationDialog.tsx`
- [ ] Implement layout status fetching
- [ ] Show role-based action buttons
- [ ] Handle reset action
- [ ] Mobile-optimize layout

**6.2: LayoutEditorShell Component**
- [ ] Create `src/components/gameplay/LayoutEditorShell/index.tsx`
- [ ] Create `EditorHeader.tsx` (Back, title, Save button)
- [ ] Create `SavePrivateLayoutModal.tsx`
- [ ] Create `PublishGlobalLayoutModal.tsx` (change notes input)
- [ ] Load initial layout data
- [ ] Wrap HUDStudio editor (DO NOT MODIFY EDITOR)
- [ ] Handle save/publish workflows
- [ ] Show loading states

**6.3: GlobalLayoutHistory Component**
- [ ] Create `src/components/gameplay/GlobalLayoutHistory/index.tsx`
- [ ] Create `RestoreConfirmationDialog.tsx`
- [ ] List all versions with metadata
- [ ] Implement restore workflow
- [ ] Handle admin-only access
- [ ] Mobile-optimize

**Success Criteria**:
- ✅ All components render without errors
- ✅ Components are mobile-responsive
- ✅ Permission-based UI visibility works
- ✅ Role-appropriate buttons shown/hidden
- ✅ Modal dialogs work correctly
- ✅ No modifications to existing HUD Studio

**Duration Estimate**: 6 hours

**Depends On**: TASK 5

---

### TASK 7: Routes & Pages

**Objective**: Create page files for settings, editing, and history

**Subtasks**:
- [ ] Create `src/app/(player)/profile/gameplay-layout/page.tsx`
  - Import GameplayLayoutSettings component
  - Integrate into Profile page
  - Mobile layout

- [ ] Create `src/app/(player)/profile/gameplay-layout/edit/page.tsx`
  - Import LayoutEditorShell with layoutType='private'
  - Load private or current global layout
  - Private edit flow

- [ ] Create `src/app/(player)/profile/gameplay-layout/edit-global/page.tsx`
  - Admin permission check (component-level)
  - Import LayoutEditorShell with layoutType='global'
  - Load current global layout
  - Global edit flow

- [ ] Create `src/app/(player)/profile/gameplay-layout/history/page.tsx`
  - Admin permission check (component-level)
  - Import GlobalLayoutHistory component
  - Version history display

- [ ] Update `src/app/(player)/profile/page.tsx`
  - Add navigation link to Gameplay Layout settings
  - Add section in profile page

**Success Criteria**:
- ✅ All pages render correctly
- ✅ Navigation works (Profile → Gameplay Layout → Edit)
- ✅ Back button returns to previous page
- ✅ Admin pages redirect non-admins
- ✅ Mobile layouts are responsive
- ✅ Pages load within 2 seconds

**Duration Estimate**: 3 hours

**Depends On**: TASK 6

---

### TASK 8: Permission Guards & Middleware

**Objective**: Ensure proper access control at all levels

**Subtasks**:
- [ ] Create admin permission check middleware for edit-global page
- [ ] Create admin permission check middleware for history page
- [ ] Add useUserRole checks in components
- [ ] Hide admin-only buttons from non-admins
- [ ] Verify backend rejects unauthorized API calls
- [ ] Test permission denied flows
- [ ] Document permission model

**Success Criteria**:
- ✅ Non-admins cannot access edit-global page
- ✅ Non-admins cannot access history page
- ✅ Non-admins cannot call admin API endpoints (403)
- ✅ Edit buttons hidden from non-admins
- ✅ Admin buttons hidden from non-admins
- ✅ Backend permission checks work independently of frontend

**Duration Estimate**: 2 hours

**Depends On**: TASK 7

---

### TASK 9: Integration Tests

**Objective**: Test complete workflows end-to-end

**Subtasks**:
- [ ] Test: Player saves private layout → loads in gameplay
- [ ] Test: Admin publishes global layout → loads for all players
- [ ] Test: Player resets to global layout
- [ ] Test: Admin restores previous version
- [ ] Test: Permission denied for non-admin
- [ ] Test: Concurrent save operations
- [ ] Test: Network error handling
- [ ] Test: Invalid layout validation

**Success Criteria**:
- ✅ All workflows complete successfully
- ✅ Data persists correctly
- ✅ Other users not affected by changes
- ✅ Permissions enforced correctly
- ✅ Error messages are clear
- ✅ No database corruption

**Duration Estimate**: 4 hours

**Depends On**: TASK 8

---

### TASK 10: Mobile & Telegram Optimization

**Objective**: Ensure feature works perfectly on mobile and Telegram

**Subtasks**:
- [ ] Test on mobile devices (iOS/Android)
- [ ] Verify touch targets (44×44px minimum)
- [ ] Test full-screen editor mode
- [ ] Verify button spacing prevents accidental taps
- [ ] Test in Telegram WebView
- [ ] Integrate Telegram back button
- [ ] Test with different screen sizes
- [ ] Test with soft keyboard visible
- [ ] Optimize performance for mobile
- [ ] Add haptic feedback (optional)

**Success Criteria**:
- ✅ All buttons easily tappable
- ✅ No accidental taps due to small targets
- ✅ Editor works in full-screen mode
- ✅ Works in Telegram WebView
- ✅ Responsive layout on all screen sizes
- ✅ Touch interactions responsive (< 100ms)
- ✅ No horizontal scroll

**Duration Estimate**: 3 hours

**Depends On**: TASK 9

---

### TASK 11: Error Handling & Polish

**Objective**: Handle edge cases and improve user experience

**Subtasks**:
- [ ] Add error toast notifications
- [ ] Add loading skeletons
- [ ] Add timeout handling for slow networks
- [ ] Add retry logic for failed operations
- [ ] Handle server errors gracefully
- [ ] Add confirmation dialogs for destructive actions
- [ ] Validate edge cases (empty layout, corrupted data)
- [ ] Test error scenarios
- [ ] Polish animations and transitions
- [ ] Add accessibility attributes (aria-labels, roles)

**Success Criteria**:
- ✅ All error cases handled
- ✅ User-friendly error messages
- ✅ Clear loading states
- ✅ Destructive actions require confirmation
- ✅ Accessibility compliant
- ✅ No unhandled rejections in console
- ✅ Smooth animations

**Duration Estimate**: 3 hours

**Depends On**: TASK 10

---

### TASK 12: Documentation & Rollout

**Objective**: Document implementation and prepare for production

**Subtasks**:
- [ ] Create IMPLEMENTATION_NOTES.md
- [ ] Document API endpoints
- [ ] Document database schema changes
- [ ] Create admin guide for publishing layouts
- [ ] Create user guide for saving custom layouts
- [ ] Add code comments to complex sections
- [ ] Create deployment checklist
- [ ] Plan gradual rollout (10% → 50% → 100%)
- [ ] Set up monitoring for errors
- [ ] Create rollback plan

**Success Criteria**:
- ✅ All changes documented
- ✅ Admin guide is clear
- ✅ User guide is accessible
- ✅ Code is commented
- ✅ Deployment checklist complete
- ✅ Monitoring configured
- ✅ Rollback plan ready

**Duration Estimate**: 2 hours

**Depends On**: TASK 11

---

## Summary

**Total Tasks**: 12 main tasks + 3 sub-feature groups
**Total Duration Estimate**: ~40-45 hours
**Parallel Opportunities**: 
- Tasks 3.1, 3.2, 3.3 can run in parallel after TASK 2
- Tasks 6.1, 6.2, 6.3 can run in parallel after TASK 5
- Task 10 can run alongside Task 9

**Critical Path**:
TASK 1 → TASK 2 → TASK 3.4 → TASK 4 → TASK 5 → TASK 6 → TASK 7 → TASK 8 → TASK 9 → TASK 10 → TASK 11 → TASK 12

---

*Tasks Version: 1.0*  
*Status: Ready for Execution*
