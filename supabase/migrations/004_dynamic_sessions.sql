-- Dynamic Session Configuration
-- Migration 004

-- Update sessions table to support dynamic phase configuration
-- Keep backward compatibility: if old phase_config exists, auto-convert to new format
ALTER TABLE sessions
  ALTER COLUMN phase_config SET DEFAULT '[
    {"phase": 1, "duration_minutes": 6, "elimination_rule": "target", "config": {"target": 38, "revivable_min": 35, "revivable_max": 37.5, "eliminated_below": 35}},
    {"phase": 2, "duration_minutes": 6, "elimination_rule": "percentage", "config": {"eliminate_bottom_pct": 60}},
    {"phase": 3, "duration_minutes": 5, "elimination_rule": "percentage", "config": {"eliminate_bottom_pct": 70}},
    {"phase": 4, "duration_minutes": 3, "elimination_rule": "none", "config": {}}
  ]'::jsonb;

-- Create a function to help convert old phase_config to new format (backward compatibility)
CREATE OR REPLACE FUNCTION convert_old_phase_config(old_config jsonb)
RETURNS jsonb AS $$
DECLARE
  new_phases jsonb[];
BEGIN
  -- Check if it's already in new format (array)
  IF jsonb_typeof(old_config) = 'array' THEN
    RETURN old_config;
  END IF;

  new_phases := ARRAY[]::jsonb[];

  -- Phase 1
  IF old_config ? 'phase1' THEN
    new_phases := array_append(new_phases, jsonb_build_object(
      'phase', 1,
      'duration_minutes', 6,
      'elimination_rule', 'target',
      'config', old_config->'phase1'
    ));
  END IF;

  -- Phase 2
  IF old_config ? 'phase2' THEN
    new_phases := array_append(new_phases, jsonb_build_object(
      'phase', 2,
      'duration_minutes', 6,
      'elimination_rule', 'percentage',
      'config', old_config->'phase2'
    ));
  END IF;

  -- Phase 3
  IF old_config ? 'phase3' THEN
    new_phases := array_append(new_phases, jsonb_build_object(
      'phase', 3,
      'duration_minutes', 5,
      'elimination_rule', 'percentage',
      'config', old_config->'phase3'
    ));
  END IF;

  -- Phase 4
  new_phases := array_append(new_phases, jsonb_build_object(
    'phase', 4,
    'duration_minutes', COALESCE((old_config->'phase4'->>'duration_minutes')::int, 3),
    'elimination_rule', 'none',
    'config', jsonb_build_object()
  ));

  RETURN to_jsonb(new_phases);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Convert existing session configs to new format (backward compatibility)
UPDATE sessions
SET phase_config = convert_old_phase_config(phase_config)
WHERE jsonb_typeof(phase_config) = 'object';
