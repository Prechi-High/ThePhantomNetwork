-- MVP2: camp revenue, platform config, moderation
-- Migration 002

ALTER TABLE camps
  ADD COLUMN IF NOT EXISTS revenue_share_pct NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  ADD COLUMN IF NOT EXISTS wallet_balance_cents INTEGER NOT NULL DEFAULT 0 CHECK (wallet_balance_cents >= 0);

CREATE TABLE IF NOT EXISTS camp_revenue_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  event_type TEXT NOT NULL DEFAULT 'entry_fee_share',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_camp_revenue_events_camp ON camp_revenue_events(camp_id);
CREATE INDEX IF NOT EXISTS idx_camp_revenue_events_session ON camp_revenue_events(session_id);

CREATE TABLE IF NOT EXISTS platform_config (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  default_platform_fee_pct NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  default_entry_fee_cents INTEGER NOT NULL DEFAULT 500,
  default_camp_revenue_share_pct NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  camp_switch_level INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO platform_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
