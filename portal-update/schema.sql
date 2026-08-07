-- F&F Web Systems — Client Portal schema

CREATE TABLE IF NOT EXISTS clients (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email         TEXT,
  -- Fixed-stage progress: 0=Design, 1=Development, 2=Review, 3=Live
  progress_stage INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS files (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id    INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  r2_key       TEXT NOT NULL,
  filename     TEXT NOT NULL,
  content_type TEXT,
  size_bytes   INTEGER,
  uploaded_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Invite-based flow for collecting client access to third-party accounts
-- (e.g. Cloudflare). We never store the client's password — only the email
-- to invite and the status of that invite, with an optional encrypted
-- fallback field for services that have no invite/collaborator mechanism.
CREATE TABLE IF NOT EXISTS access_requests (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id        INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  service          TEXT NOT NULL,           -- e.g. 'cloudflare', 'godaddy'
  account_email    TEXT,                    -- client's account email/username on that service
  status           TEXT NOT NULL DEFAULT 'requested', -- requested | invited | accepted | fallback_stored
  encrypted_fallback TEXT,                  -- only used if no invite option exists
  notes            TEXT,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_files_client ON files(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_client ON access_requests(client_id);
