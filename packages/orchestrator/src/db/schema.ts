export const SCHEMA = `
CREATE TABLE IF NOT EXISTS drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  threadId TEXT NOT NULL,
  site TEXT NOT NULL,
  draftText TEXT NOT NULL,
  confidence TEXT,
  requiresReview BOOLEAN DEFAULT 1,
  status TEXT DEFAULT 'pending',
  createdAt TEXT NOT NULL,
  approvedAt TEXT,
  sentAt TEXT,
  error TEXT,
  UNIQUE(threadId, site, createdAt)
);

CREATE INDEX IF NOT EXISTS idx_drafts_status ON drafts(status);
CREATE INDEX IF NOT EXISTS idx_drafts_site_status ON drafts(site, status);
`;
