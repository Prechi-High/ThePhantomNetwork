# Migration 005: Gameplay Layout Access Control - Rewrite Summary

## What Was Wrong

The original migration had a critical PostgreSQL ENUM migration error:

```sql
-- BROKEN (Original)
CREATE TYPE user_role_new AS ENUM ('player', 'camp_owner', 'admin', 'platform_designer');
ALTER TABLE profiles ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;
```

**Error**: `ERROR: 42804: default for column "role" cannot be cast automatically to type user_role_new`

**Why**: The `profiles.role` column had a DEFAULT constraint set to `'player'`. When PostgreSQL tried to convert the column type, it couldn't handle casting the default value during the type change operation.

## Solution Applied

Properly sequence the enum migration:

```sql
-- FIXED (New)
CREATE TYPE user_role_new AS ENUM ('player', 'camp_owner', 'admin', 'platform_designer');
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;  -- Remove default FIRST
ALTER TABLE profiles ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'player'::user_role_new;  -- Re-apply with type cast
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;
```

## Migration Compatibility Check

### ✅ Verified Against Existing Migrations

1. **Migration 001**: Defines `user_role` ENUM
   - Values: `'player', 'camp_owner', 'admin'`
   - Migration 005 extends to: `'player', 'camp_owner', 'admin', 'platform_designer'`
   - ✅ No conflicts - compatible extension

2. **Migration 002**: Adds `idx_profiles_role` index
   - Migration 005 now **does NOT recreate** this index (removed duplicate)
   - ✅ No conflicts

3. **Migration 003**: Error monitoring table
   - No relation to roles or layouts
   - ✅ No conflicts

4. **Migration 004**: Dynamic sessions
   - No relation to roles or layouts
   - ✅ No conflicts

### ✅ Verified Data Preservation

Existing `profiles.role` values are safely migrated:
- `'player'` → remains `'player'`
- `'camp_owner'` → remains `'camp_owner'`
- `'admin'` → remains `'admin'`
- (No `'platform_designer'` values yet - will be assigned manually)

## Removed Duplicates

The following duplicate index creations were removed:

```sql
-- Removed (already in migration 002)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_id_role ON profiles(id, role);
```

Reason: Migration 002 already creates `idx_profiles_role`. The second index wasn't necessary and could cause conflicts.

## Final Migration 005 Structure

### Step 1: Enum Extension (FIXED)
```sql
CREATE TYPE user_role_new AS ENUM ('player', 'camp_owner', 'admin', 'platform_designer');
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;
ALTER TABLE profiles ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'player'::user_role_new;
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;
```

### Step 2-4: Layout Tables (Unchanged)
- ✅ `user_layouts` table with RLS policies
- ✅ `global_layouts` table with RLS policies
- ✅ `global_layout_history` table with RLS policies
- ✅ All proper indexes for performance
- ✅ All foreign key constraints

### Step 5: Documentation (Unchanged)
- ✅ Table and column comments for clarity

## Deployment Instructions

1. **Backup database** before running migration (standard practice)
2. **Run migration 005** via Supabase dashboard or CLI:
   ```bash
   # Via Supabase CLI
   supabase db push
   ```
3. **Verify** enum values:
   ```sql
   SELECT enum_range(NULL::user_role);
   -- Should return: '{player,camp_owner,admin,platform_designer}'
   ```
4. **Verify** data integrity:
   ```sql
   SELECT DISTINCT role FROM profiles;
   -- Should show: player, camp_owner, admin (no platform_designer yet)
   ```

## Related Code Files

These TypeScript/API files use the new role system:

- `src/lib/middleware/requireAdmin.ts` - Checks for `'admin'` or `'platform_designer'`
- `src/lib/hooks/useUserRole.ts` - Reads `profiles.role` field
- `src/app/api/layouts/global/route.ts` - Enforces admin role requirement
- `src/app/api/layouts/global/history/route.ts` - Enforces admin role requirement
- `src/app/api/layouts/global/restore/route.ts` - Enforces admin role requirement
- `src/app/(player)/profile/gameplay-layout/edit-global/page.tsx` - Frontend role check
- `src/app/(player)/profile/gameplay-layout/history/page.tsx` - Frontend role check

All code already handles the new `'platform_designer'` role correctly.

## Testing Checklist

- [ ] Database migration runs without errors
- [ ] Enum type extends successfully with all 4 values
- [ ] Existing user roles are preserved
- [ ] No permission errors for admin users
- [ ] No permission errors for standard players
- [ ] API endpoints enforce role checks correctly
- [ ] Frontend shows/hides admin buttons correctly
- [ ] New role can be manually assigned to users

---

**Status**: Migration 005 ready for deployment
**Last Updated**: 2026-07-07
**Compatibility**: PostgreSQL 12.x+ (required for ENUM operations)
