-- Run this only if you already applied the original schema.sql before
-- progress tracking was added. Safe to skip if deploying schema.sql fresh.

ALTER TABLE clients ADD COLUMN progress_stage INTEGER NOT NULL DEFAULT 0;
