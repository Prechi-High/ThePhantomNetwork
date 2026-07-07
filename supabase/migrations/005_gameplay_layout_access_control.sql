-- 005_gameplay_layout_access_control.sql
-- Adds role-based gameplay layout access control and publishing workflow

-- Step 1: Extend user_role enum with 'platform_designer'
-- Note: We need to recreate the ENUM type since PostgreSQL doesn't support direct ALTER on ENUMS
-- 
-- Process:
-- 1. Create new enum type with all values (old + new)
-- 2. Remove default from profiles.role column temporarily
-- 3. Cast to text, then back to new enum type
-- 4. Drop old enum
-- 5. Rename new enum
-- 6. Set default back

-- Create new enum type with all values
CREATE TYPE user_role_new AS ENUM ('player', 'camp_owner', 'admin', 'platform_designer');

-- Remove the default constraint from profiles.role temporarily
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

-- Update the column type using text as intermediate
ALTER TABLE profiles ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;

-- Set the default back to 'player'
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'player'::user_role_new;

-- Drop old enum type and rename new one
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;

-- Step 2: Create user_layouts table (private user-specific layouts)
CREATE TABLE IF NOT EXISTS user_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  layout_json JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_layouts_user_id 
  ON user_layouts(user_id);
  
CREATE INDEX IF NOT EXISTS idx_user_layouts_active 
  ON user_layouts(user_id, is_active);

-- Enable RLS
ALTER TABLE user_layouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only read/write their own layouts
CREATE POLICY "Users can read own layouts" ON user_layouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own layouts" ON user_layouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own layouts" ON user_layouts
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own layouts" ON user_layouts
  FOR DELETE USING (auth.uid() = user_id);

-- Step 3: Create global_layouts table (published layouts for all players)
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_layouts_active 
  ON global_layouts(is_active);
  
CREATE INDEX IF NOT EXISTS idx_global_layouts_version 
  ON global_layouts(version DESC);

-- Enable RLS
ALTER TABLE global_layouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Anyone can read global layouts, only admins can write
CREATE POLICY "Anyone can read global layouts" ON global_layouts
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert global layouts" ON global_layouts
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'platform_designer')
    )
  );

CREATE POLICY "Only admins can update global layouts" ON global_layouts
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'platform_designer')
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'platform_designer')
    )
  );

-- Step 4: Create global_layout_history table (archived versions)
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_global_layout_history_version 
  ON global_layout_history(version DESC);
  
CREATE INDEX IF NOT EXISTS idx_global_layout_history_layout_id 
  ON global_layout_history(layout_id);

-- Enable RLS
ALTER TABLE global_layout_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Only admins can read history
CREATE POLICY "Admins can read layout history" ON global_layout_history
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'platform_designer')
    )
  );

CREATE POLICY "Admins can insert layout history" ON global_layout_history
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role IN ('admin', 'platform_designer')
    )
  );

-- Step 5: Add comments for documentation
COMMENT ON TABLE user_layouts IS 'User-specific private HUD layouts. Each user can have one active layout.';
COMMENT ON COLUMN user_layouts.is_active IS 'Only one active layout per user. Previous layouts deactivated on save.';

COMMENT ON TABLE global_layouts IS 'Platform-wide default HUD layouts. Published by admins, applies to all players without private overrides.';
COMMENT ON COLUMN global_layouts.version IS 'Auto-incrementing version number. Allows tracking layout history.';
COMMENT ON COLUMN global_layouts.is_active IS 'Only one active global layout at a time. Used when resolving active layout for gameplay.';

COMMENT ON TABLE global_layout_history IS 'Archive of previous global layout versions. Enables restore functionality.';
COMMENT ON COLUMN global_layout_history.version IS 'Original version number of archived layout.';
COMMENT ON COLUMN global_layout_history.archived_by IS 'User ID of admin who triggered the archiving (e.g., by publishing new version).';
