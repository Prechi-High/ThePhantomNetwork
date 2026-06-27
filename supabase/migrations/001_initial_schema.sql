-- THE PHANTOM initial schema
-- Migration 001

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('player', 'camp_owner', 'admin');
CREATE TYPE session_status AS ENUM ('draft', 'open', 'locked', 'active', 'completed', 'invalid');
CREATE TYPE squad_member_role AS ENUM ('leader', 'member');
CREATE TYPE wallet_tx_type AS ENUM ('deposit', 'entry_fee', 'reward', 'refund', 'shop_purchase', 'withdrawal');
CREATE TYPE shop_economy AS ENUM ('session_cash', 'squad_tokens', 'prestige_cash');
CREATE TYPE session_event_type AS ENUM ('spin', 'steal', 'steal_blocked', 'revive', 'amplify', 'elimination', 'phase_change');

-- Camps (before profiles for FK)
CREATE TABLE camps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID,
  is_default BOOLEAN NOT NULL DEFAULT false,
  member_count INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  leaderboard_score INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE,
  camp_switch_level INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id BIGINT UNIQUE,
  google_id TEXT UNIQUE,
  username TEXT,
  avatar_id TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  prestige_score INTEGER NOT NULL DEFAULT 0,
  camp_id UUID REFERENCES camps(id),
  captcha_verified_at TIMESTAMPTZ,
  wallet_balance_cents INTEGER NOT NULL DEFAULT 0 CHECK (wallet_balance_cents >= 0),
  role user_role NOT NULL DEFAULT 'player',
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE camps ADD CONSTRAINT camps_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES profiles(id);

-- Squads
CREATE TABLE squads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  is_permanent BOOLEAN NOT NULL DEFAULT true,
  leader_id UUID NOT NULL REFERENCES profiles(id),
  member_count INTEGER NOT NULL DEFAULT 1,
  squad_tokens INTEGER NOT NULL DEFAULT 0,
  history_sessions INTEGER NOT NULL DEFAULT 0,
  banner_id TEXT,
  emblem_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE squad_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role squad_member_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (squad_id, user_id),
  UNIQUE (user_id) -- one permanent squad per user
);

CREATE TABLE squad_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES profiles(id),
  invitee_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (squad_id, invitee_id)
);

-- Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  status session_status NOT NULL DEFAULT 'draft',
  starts_at TIMESTAMPTZ NOT NULL,
  registration_closes_at TIMESTAMPTZ NOT NULL,
  entry_fee_cents INTEGER NOT NULL DEFAULT 500,
  max_players INTEGER NOT NULL DEFAULT 1000,
  phase_config JSONB NOT NULL DEFAULT '{
    "phase1": {"target": 38, "revivable_min": 35, "revivable_max": 37.5, "eliminated_below": 35},
    "phase2": {"eliminate_bottom_pct": 60},
    "phase3": {"eliminate_bottom_pct": 70},
    "phase4": {"duration_minutes": 3}
  }'::jsonb,
  platform_fee_pct NUMERIC(5,2) NOT NULL DEFAULT 15.00,
  economy_config JSONB NOT NULL DEFAULT '{
    "winner_pct": 25,
    "refund_ranks": [7,8,9,10,11,12,13,14,15,16],
    "performance_ranks": [2,3,4,5,6],
    "performance_pool_pct": 60,
    "winner_squad_pool_pct": 40
  }'::jsonb,
  registered_count INTEGER NOT NULL DEFAULT 0,
  total_pool_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE session_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  squad_id UUID REFERENCES squads(id),
  entry_paid_cents INTEGER NOT NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, user_id)
);

CREATE TABLE sub_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  player_count INTEGER NOT NULL DEFAULT 0,
  pool_cents INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  winner_id UUID REFERENCES profiles(id),
  current_phase INTEGER NOT NULL DEFAULT 0,
  phase_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sub_session_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sub_session_id UUID NOT NULL REFERENCES sub_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  squad_id UUID REFERENCES squads(id),
  is_temporary_squad BOOLEAN NOT NULL DEFAULT false,
  session_tokens NUMERIC(10,1) NOT NULL DEFAULT 0,
  final_tokens NUMERIC(10,1),
  final_rank INTEGER,
  elimination_phase INTEGER,
  is_eliminated BOOLEAN NOT NULL DEFAULT false,
  is_revivable BOOLEAN NOT NULL DEFAULT false,
  shield_count INTEGER NOT NULL DEFAULT 0,
  cloak_active BOOLEAN NOT NULL DEFAULT false,
  cloak_expires_at TIMESTAMPTZ,
  insurance_active BOOLEAN NOT NULL DEFAULT false,
  steal_boost_active BOOLEAN NOT NULL DEFAULT false,
  shield_boost_active BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (sub_session_id, user_id)
);

CREATE TABLE player_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  shield_count INTEGER NOT NULL DEFAULT 0,
  cloak_count INTEGER NOT NULL DEFAULT 0,
  insurance_count INTEGER NOT NULL DEFAULT 0,
  steal_boost_active BOOLEAN NOT NULL DEFAULT false,
  shield_boost_active BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (user_id, session_id)
);

CREATE TABLE session_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sub_session_id UUID NOT NULL REFERENCES sub_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  event_type session_event_type NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE rivalries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a UUID NOT NULL REFERENCES profiles(id),
  user_b UUID NOT NULL REFERENCES profiles(id),
  intensity INTEGER NOT NULL DEFAULT 1,
  last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);

CREATE TABLE steals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sub_session_id UUID NOT NULL REFERENCES sub_sessions(id),
  attacker_id UUID NOT NULL REFERENCES profiles(id),
  victim_id UUID NOT NULL REFERENCES profiles(id),
  base_amount NUMERIC(10,1) NOT NULL DEFAULT 1,
  boost_amount NUMERIC(10,1) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,1) NOT NULL,
  blocked_by_shield BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE revives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sub_session_id UUID NOT NULL REFERENCES sub_sessions(id),
  revived_user_id UUID NOT NULL REFERENCES profiles(id),
  contributor_id UUID NOT NULL REFERENCES profiles(id),
  tokens_contributed NUMERIC(10,1) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type wallet_tx_type NOT NULL,
  amount_cents INTEGER NOT NULL,
  balance_after_cents INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  stripe_payment_intent_id TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE session_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  sub_session_id UUID NOT NULL REFERENCES sub_sessions(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  rank INTEGER NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '{}',
  total_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  economy shop_economy NOT NULL,
  price_cents INTEGER,
  price_squad_tokens INTEGER,
  level_required INTEGER DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE shop_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  shop_item_id UUID NOT NULL REFERENCES shop_items(id),
  session_id UUID REFERENCES sessions(id),
  squad_id UUID REFERENCES squads(id),
  amount_paid_cents INTEGER,
  amount_paid_tokens INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  badge_id UUID NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

CREATE TABLE captcha_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  token_hash TEXT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_hash TEXT
);

CREATE TABLE live_feed_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE session_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  sub_session_id UUID NOT NULL REFERENCES sub_sessions(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  final_rank INTEGER,
  final_tokens NUMERIC(10,1),
  teammates JSONB NOT NULL DEFAULT '[]',
  rivals JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auth trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'phantom_' || substr(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER camps_updated_at BEFORE UPDATE ON camps FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER squads_updated_at BEFORE UPDATE ON squads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_feed_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Camps are public" ON camps FOR SELECT USING (true);
CREATE POLICY "Squads are public" ON squads FOR SELECT USING (true);
CREATE POLICY "Squad members are public" ON squad_members FOR SELECT USING (true);

CREATE POLICY "Sessions are public" ON sessions FOR SELECT USING (true);
CREATE POLICY "Registrations viewable by owner" ON session_registrations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Wallet tx viewable by owner" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Live feed public" ON live_feed_events FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_profiles_telegram ON profiles(telegram_id);
CREATE INDEX idx_profiles_camp ON profiles(camp_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_starts_at ON sessions(starts_at);
CREATE INDEX idx_session_registrations_session ON session_registrations(session_id);
CREATE INDEX idx_sub_session_players_sub ON sub_session_players(sub_session_id);
CREATE INDEX idx_session_events_sub ON session_events(sub_session_id, created_at);
CREATE INDEX idx_rivalries_users ON rivalries(user_a, user_b);
CREATE INDEX idx_live_feed_created ON live_feed_events(created_at DESC);
