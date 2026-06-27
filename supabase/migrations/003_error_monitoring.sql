-- Error monitoring (MVP2+)
-- Migration 003

CREATE TYPE error_severity AS ENUM ('critical', 'high', 'medium', 'low');

CREATE TABLE app_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  severity error_severity NOT NULL DEFAULT 'medium',
  area TEXT NOT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  cause TEXT,
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  url TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  request_id TEXT,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_app_errors_severity ON app_errors(severity);
CREATE INDEX idx_app_errors_area ON app_errors(area);
CREATE INDEX idx_app_errors_created_at ON app_errors(created_at DESC);
CREATE INDEX idx_app_errors_resolved ON app_errors(resolved);
