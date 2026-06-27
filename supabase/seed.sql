-- Default Phantom Camp, avatars config, shop items, badges
INSERT INTO camps (name, slug, is_default, referral_code, camp_switch_level)
VALUES ('Phantom Camp', 'phantom-camp', true, 'PHANTOM', 5);

INSERT INTO shop_items (slug, name, description, economy, price_cents, metadata) VALUES
  ('shield', 'Shield', 'Blocks one steal attempt automatically', 'session_cash', 200, '{"blocks": 1}'),
  ('cloak', 'Cloak', 'Removes you from steal target list for 60 seconds', 'session_cash', 300, '{"duration_seconds": 60}'),
  ('insurance', 'Insurance', 'Threshold protection for phase eliminations', 'session_cash', 400, '{}'),
  ('steal_boost', 'Steal Boost', 'Increases steal output by 50%', 'session_cash', 250, '{"multiplier": 1.5}'),
  ('shield_boost', 'Shield Boost', 'Shield absorbs 2 attacks instead of 1', 'session_cash', 350, '{"blocks": 2}');

INSERT INTO shop_items (slug, name, description, economy, price_squad_tokens, metadata) VALUES
  ('squad_banner', 'Squad Banner', 'Custom squad banner', 'squad_tokens', 500, '{}'),
  ('squad_emblem', 'Squad Emblem', 'Custom squad emblem', 'squad_tokens', 300, '{}'),
  ('squad_aura', 'Squad Aura', 'Glowing squad aura effect', 'squad_tokens', 800, '{}'),
  ('squad_wheel_skin', 'Squad Wheel Skin', 'Custom spin wheel skin', 'squad_tokens', 600, '{}');

INSERT INTO shop_items (slug, name, description, economy, price_cents, level_required, metadata) VALUES
  ('phantom_elite_title', 'Phantom Elite Title', 'Prestige title for elite players', 'prestige_cash', 1000, 10, '{}'),
  ('shadow_king_frame', 'Shadow King Frame', 'Legendary profile frame', 'prestige_cash', 1500, 15, '{}');

INSERT INTO badges (slug, name, description, icon) VALUES
  ('first_session', 'First Blood', 'Completed your first session', '🎯'),
  ('session_winner', 'Champion', 'Won a session', '👑'),
  ('top_15', 'Top 15 Survivor', 'Finished in top 15%', '⭐'),
  ('squad_legend', 'Squad Legend', '10 sessions with your squad', '🔥');
