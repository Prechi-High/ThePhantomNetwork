-- ============================================================================
-- Migration: Create Layout Access Control Tables
-- ============================================================================
-- Purpose: Implement database schema for gameplay layout access control feature
-- Includes: profiles.role, user_layouts, global_layouts, global_layout_history
-- Date: 2026-01-07
-- ============================================================================

-- ============================================================================
-- SECTION 1: Add role column to existing profiles table
-- ============================================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'player'
  CHECK (role IN ('player', 'admin', 'platform_designer'));

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================================
-- SECTION 2: Create user_layouts table
-- ============================================================================
-- Purpose: Store user-specific private HUD layouts
-- Isolation: Each user can have one active layout
-- Cleanup: ON DELETE CASCADE removes layouts when user is deleted

CREATE TABLE IF NOT EXISTS user_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  layout_json JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_layouts_user_id 
  ON user_layouts(user_id);

CREATE INDEX IF NOT EXISTS idx_user_layouts_active 
  ON user_layouts(user_id, is_active);

-- ============================================================================
-- SECTION 3: Create global_layouts table
-- ============================================================================
-- Purpose: Store the current active global HUD layout
-- Note: Only ONE record should have is_active = true at any time
-- Version control: Automatic integer version tracking

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

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_global_layouts_active 
  ON global_layouts(is_active);

CREATE INDEX IF NOT EXISTS idx_global_layouts_version 
  ON global_layouts(version DESC);

-- ============================================================================
-- SECTION 4: Create global_layout_history table
-- ============================================================================
-- Purpose: Archive all previous global layout versions
-- Retention: Maintains complete audit trail of published layouts
-- Read-only: System-managed only, no direct INSERT/UPDATE/DELETE from clients

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

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_global_layout_history_version 
  ON global_layout_history(version DESC);

CREATE INDEX IF NOT EXISTS idx_global_layout_history_layout_id 
  ON global_layout_history(layout_id);

-- ============================================================================
-- SECTION 5: Enable Row Level Security (RLS)
-- ============================================================================
-- Purpose: Enforce access control at database level
-- Note: RLS policies must be defined separately after enabling

ALTER TABLE user_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_layout_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 6: RLS Policies for user_layouts
-- ============================================================================
-- Access: Users can only access their own layouts
-- Operations: Full CRUD for own layouts, no access to others

-- SELECT: Users can only read their own layouts
CREATE POLICY IF NOT EXISTS "Users can read own layouts" ON user_layouts
  FOR SELECT 
  USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own layouts
CREATE POLICY IF NOT EXISTS "Users can create own layouts" ON user_layouts
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own layouts
CREATE POLICY IF NOT EXISTS "Users can update own layouts" ON user_layouts
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- DELETE: Users can only delete their own layouts
CREATE POLICY IF NOT EXISTS "Users can delete own layouts" ON user_layouts
  FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================================
-- SECTION 7: RLS Policies for global_layouts
-- ============================================================================
-- Access: Read-only for all authenticated users, write-only for admins
-- Operations: All users can select, only admins/platform_designers can insert

-- SELECT: Anyone can read global layouts
CREATE POLICY IF NOT EXISTS "Anyone can read global layouts" ON global_layouts
  FOR SELECT 
  USING (true);

-- INSERT: Only admins and platform designers can insert global layouts
CREATE POLICY IF NOT EXISTS "Only admins can insert global layouts" ON global_layouts
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'platform_designer')
    )
  );

-- UPDATE: Prevent updates (only inserts and reads allowed)
-- This is enforced by NOT creating an UPDATE policy

-- DELETE: Prevent deletes (only admins should use system procedures)
-- This is enforced by NOT creating a DELETE policy

-- ============================================================================
-- SECTION 8: RLS Policies for global_layout_history
-- ============================================================================
-- Access: Read-only for admins, no write operations from clients
-- Operations: Admins can select only, all writes via system procedures

-- SELECT: Only admins and platform designers can read history
CREATE POLICY IF NOT EXISTS "Admins can read layout history" ON global_layout_history
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'platform_designer')
    )
  );

-- All write operations (INSERT, UPDATE, DELETE) are prevented
-- History is managed exclusively by system backend procedures

-- ============================================================================
-- ROLLBACK INSTRUCTIONS
-- ============================================================================
-- To roll back this migration, execute:
--
-- DROP POLICY IF EXISTS "Users can read own layouts" ON user_layouts;
-- DROP POLICY IF EXISTS "Users can create own layouts" ON user_layouts;
-- DROP POLICY IF EXISTS "Users can update own layouts" ON user_layouts;
-- DROP POLICY IF EXISTS "Users can delete own layouts" ON user_layouts;
-- DROP POLICY IF EXISTS "Anyone can read global layouts" ON global_layouts;
-- DROP POLICY IF EXISTS "Only admins can insert global layouts" ON global_layouts;
-- DROP POLICY IF EXISTS "Admins can read layout history" ON global_layout_history;
--
-- ALTER TABLE user_layouts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE global_layouts DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE global_layout_history DISABLE ROW LEVEL SECURITY;
--
-- DROP TABLE IF EXISTS global_layout_history;
-- DROP TABLE IF EXISTS global_layouts;
-- DROP TABLE IF EXISTS user_layouts;
--
-- DROP INDEX IF EXISTS idx_profiles_role;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS role;
--
-- ============================================================================
-- VERIFICATION CHECKLIST
-- ============================================================================
-- After applying this migration, verify:
--
-- [ ] profiles table has role column with CHECK constraint
-- [ ] user_layouts table exists with correct schema
-- [ ] global_layouts table exists with correct schema
-- [ ] global_layout_history table exists with correct schema
--
-- [ ] All indexes are created on both tables
-- [ ] RLS is enabled on all three tables
-- [ ] RLS policies are correctly configured
--
-- [ ] Foreign key constraints are active (CASCADE delete for user_layouts)
-- [ ] JSONB columns properly store layout data
-- [ ] DEFAULT values work correctly (UUIDs, timestamps, booleans)
--
-- Verification queries:
-- SELECT * FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role';
-- SELECT * FROM pg_indexes WHERE tablename IN ('user_layouts', 'global_layouts', 'global_layout_history');
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('user_layouts', 'global_layouts', 'global_layout_history');
-- SELECT policyname FROM pg_policies WHERE tablename IN ('user_layouts', 'global_layouts', 'global_layout_history');
--
-- ============================================================================
