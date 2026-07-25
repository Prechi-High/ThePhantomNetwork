-- Private AI Practice sessions: track creator for visibility scoping
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_created_by ON sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_sessions_type_creator ON sessions(session_type, created_by);
