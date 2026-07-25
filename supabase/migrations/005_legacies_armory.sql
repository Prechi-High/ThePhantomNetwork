-- LEGACIES Armory migration
-- Persistent Legacy Credits, tactical inventory, loadouts, solo session modes

-- Extend shop economy enum
ALTER TYPE shop_economy ADD VALUE IF NOT EXISTS 'legacy_credits';

-- Legacy Credits on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS legacy_credits INTEGER NOT NULL DEFAULT 500;

-- Session mode and type
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_mode TEXT NOT NULL DEFAULT 'squad'
  CHECK (session_mode IN ('squad', 'solo'));
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS session_type TEXT NOT NULL DEFAULT 'public'
  CHECK (session_type IN ('public', 'friend_duel', 'private', 'ai_practice'));

-- Persistent tactical inventory
CREATE TABLE IF NOT EXISTS player_tactical_inventory (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  asset_slug TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, asset_slug)
);

-- Loadouts
CREATE TABLE IF NOT EXISTS player_loadouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default',
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loadout_items (
  loadout_id UUID NOT NULL REFERENCES player_loadouts(id) ON DELETE CASCADE,
  asset_slug TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (loadout_id, asset_slug)
);

-- Legacy credit ledger
CREATE TABLE IF NOT EXISTS legacy_credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Session runtime consumables (copied from loadout at join)
CREATE TABLE IF NOT EXISTS session_loadout_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  asset_slug TEXT NOT NULL,
  equipped_quantity INTEGER NOT NULL DEFAULT 0,
  used_quantity INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, session_id, asset_slug)
);

-- Bot flag for AI practice
ALTER TABLE sub_session_players ADD COLUMN IF NOT EXISTS is_bot BOOLEAN NOT NULL DEFAULT false;

-- Armory shop items (Legacy Credits)
INSERT INTO shop_items (slug, name, description, economy, price_cents, metadata) VALUES
  ('guardian_lc', 'Guardian', 'Protect yourself from one incoming attack', 'legacy_credits', 120, '{"asset_slug": "guardian", "blocks": 1, "duration_seconds": 30}'),
  ('veil_lc', 'Veil', 'Hide or reduce your visibility', 'legacy_credits', 180, '{"asset_slug": "veil", "duration_seconds": 60}'),
  ('counterstrike_lc', 'Counterstrike', 'Reverse the next successful incoming attack', 'legacy_credits', 300, '{"asset_slug": "counterstrike", "duration_seconds": 30}'),
  ('intercept_lc', 'Intercept', 'Steal one tactical asset from another player', 'legacy_credits', 250, '{"asset_slug": "intercept"}'),
  ('disrupt_lc', 'Disrupt', 'Reduce opponent effectiveness', 'legacy_credits', 220, '{"asset_slug": "disrupt", "duration_seconds": 45}'),
  ('mark_lc', 'Mark', 'Mark a player for bonus steal rewards', 'legacy_credits', 160, '{"asset_slug": "mark", "duration_seconds": 60}')
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_player_tactical_inventory_user ON player_tactical_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_player_loadouts_user ON player_loadouts(user_id);
CREATE INDEX IF NOT EXISTS idx_session_loadout_state_session ON session_loadout_state(session_id, user_id);
