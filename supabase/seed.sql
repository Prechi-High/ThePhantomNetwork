-- Default Legacies Camp, avatars config, armory items, badges
INSERT INTO camps (name, slug, is_default, referral_code, camp_switch_level)
VALUES ('Legacies Camp', 'legacies-camp', true, 'LEGACIES', 5);

-- Tactical assets (Legacy Credits economy — applied after migration 005)
INSERT INTO shop_items (slug, name, description, economy, price_cents, metadata) VALUES
  ('guardian', 'Guardian', 'Protect yourself from one incoming attack before protection expires', 'session_cash', 200, '{"blocks": 1, "duration_seconds": 30}'),
  ('veil', 'Veil', 'Hide or reduce your visibility for a limited duration', 'session_cash', 300, '{"duration_seconds": 60}'),
  ('counterstrike', 'Counterstrike', 'Reverse the next successful incoming attack', 'session_cash', 300, '{"duration_seconds": 30}'),
  ('intercept', 'Intercept', 'Steal one tactical asset from another player', 'session_cash', 250, '{}'),
  ('disrupt', 'Disrupt', 'Reduce an opponent effectiveness for a short period', 'session_cash', 220, '{"duration_seconds": 45}'),
  ('mark', 'Mark', 'Mark a player as the primary target for bonus rewards', 'session_cash', 160, '{"duration_seconds": 60}');

INSERT INTO shop_items (slug, name, description, economy, price_squad_tokens, metadata) VALUES
  ('squad_banner', 'Squad Banner', 'Custom squad banner', 'squad_tokens', 500, '{}'),
  ('squad_emblem', 'Squad Emblem', 'Custom squad emblem', 'squad_tokens', 300, '{}'),
  ('squad_aura', 'Squad Aura', 'Glowing squad aura effect', 'squad_tokens', 800, '{}'),
  ('squad_wheel_skin', 'Squad Wheel Skin', 'Custom spin wheel skin', 'squad_tokens', 600, '{}');

INSERT INTO shop_items (slug, name, description, economy, price_cents, level_required, metadata) VALUES
  ('legacies_elite_title', 'Legacies Elite Title', 'Prestige title for elite players', 'prestige_cash', 1000, 10, '{}'),
  ('champion_frame', 'Champion Frame', 'Legendary profile frame', 'prestige_cash', 1500, 15, '{}');

INSERT INTO badges (slug, name, description, icon) VALUES
  ('first_session', 'First Blood', 'Completed your first session', '🎯'),
  ('session_winner', 'Legacy Forged', 'Won a session', '👑'),
  ('top_15', 'Top 15 Survivor', 'Finished in top 15%', '⭐'),
  ('squad_legend', 'Squad Legend', '10 sessions with your squad', '🔥');
