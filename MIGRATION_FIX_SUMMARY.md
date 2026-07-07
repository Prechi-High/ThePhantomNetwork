# Migration 005 Fix Summary

## Problem
Migration 005 was failing with: `ERROR: 42804: default for column "role" cannot be cast automatically to type user_role_new`

## Root Cause Analysis

### Schema Review
1. **Migration 001** created:
   - `user_role` ENUM type with values: `'player', 'camp_owner', 'admin'`
   - `profiles` table with `role user_role NOT NULL DEFAULT 'player'`

2. **Migration 002** added:
   - Index on `profiles.role` for performance
   - Additional profile columns

3. **Migration 004** (no role changes)

4. **Migration 005** (previous - broken):
   - Created new enum `user_role_new` with `'player', 'camp_owner', 'admin', 'platform_designer'`
   - Tried to cast `profiles.role` to the new enum **while the column still had a DEFAULT constraint**
   - This caused PostgreSQL to fail because it couldn't automatically cast the default value during the type change

## Solution

The fix follows the correct PostgreSQL enum migration pattern:

```sql
-- 1. Create new enum type with all values (old + new)
CREATE TYPE user_role_new AS ENUM ('player', 'camp_owner', 'admin', 'platform_designer');

-- 2. Remove the default constraint from the column FIRST
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

-- 3. Update the column type using text as intermediate cast
ALTER TABLE profiles ALTER COLUMN role TYPE user_role_new USING role::text::user_role_new;

-- 4. Set the default back to 'player' (with new enum type cast)
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'player'::user_role_new;

-- 5. Drop old enum and rename new one
DROP TYPE user_role;
ALTER TYPE user_role_new RENAME TO user_role;
```

## Key Changes in Migration 005

### Fixed
- ✅ Removed DEFAULT before type conversion
- ✅ Added explicit cast when setting DEFAULT back: `'player'::user_role_new`
- ✅ Removed duplicate index creation (`idx_profiles_role` already exists in migration 002)
- ✅ Removed duplicate role index (`idx_profiles_id_role` not needed)

### Unchanged (Correct)
- ✅ Three layout tables: `user_layouts`, `global_layouts`, `global_layout_history`
- ✅ RLS policies for all tables
- ✅ Proper indexes for performance
- ✅ Foreign key constraints

## Compatibility with Existing Data

The migration preserves all existing user roles:
- Users with role `'player'` → stays `'player'`
- Users with role `'camp_owner'` → stays `'camp_owner'`
- Users with role `'admin'` → stays `'admin'`
- New role `'platform_designer'` can be assigned to new admins

## Testing the Migration

To verify the migration works:

```bash
# In Supabase dashboard or psql:
-- Check enum values
SELECT enum_range(NULL::user_role);

-- Check profiles table
SELECT DISTINCT role FROM profiles;

-- Check default value
SELECT column_default FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';
```

Expected output:
- Enum range: `'{player,camp_owner,admin,platform_designer}'`
- Existing roles preserved in profiles
- Default: `'player'::user_role`

## Notes for Future Migrations

When extending enum types in PostgreSQL:
1. Always DROP DEFAULT before type conversion
2. Use text as intermediate type for safe casting
3. Re-apply DEFAULT with explicit type cast after conversion
4. Drop old enum only after renaming new one
5. Check for duplicate indexes/constraints in previous migrations
