-- Faction camps for onboarding camp selection
INSERT INTO camps (name, slug, is_default, referral_code, camp_switch_level, member_count, leaderboard_score)
VALUES
  ('Infernus', 'infernus', false, 'INFERNUS', 5, 0, 0),
  ('Northridge', 'northridge', false, 'NORTHRIDGE', 5, 0, 0),
  ('Solara', 'solara', true, 'SOLARA', 5, 0, 0),
  ('Veridian', 'veridian', false, 'VERIDIAN', 5, 0, 0),
  ('Nocturis', 'nocturis', false, 'NOCTURIS', 5, 0, 0)
ON CONFLICT (slug) DO NOTHING;

-- Retire legacy default if present (Solara becomes default)
UPDATE camps SET is_default = false WHERE slug = 'legacies-camp';
