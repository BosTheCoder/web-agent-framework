import Database from 'better-sqlite3';
import { SCHEMA } from './schema.js';

export interface Draft {
  id?: number;
  threadId: string;
  site: string;
  draftText: string;
  confidence?: string;
  requiresReview: boolean;
  status?: string;
  createdAt?: string;
  approvedAt?: string;
  sentAt?: string;
  error?: string;
}

export function initDatabase(db: Database.Database): void {
  db.exec(SCHEMA);
}

export function insertDraft(
  db: Database.Database,
  draft: Omit<Draft, 'id' | 'createdAt'>
): Database.RunResult {
  const stmt = db.prepare(`
    INSERT INTO drafts (threadId, site, draftText, confidence, requiresReview, status, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  return stmt.run(
    draft.threadId,
    draft.site,
    draft.draftText,
    draft.confidence || null,
    draft.requiresReview ? 1 : 0,
    draft.status || 'pending',
    new Date().toISOString()
  );
}

export function getDraftsByStatus(db: Database.Database, status: string): Draft[] {
  const stmt = db.prepare(`
    SELECT * FROM drafts WHERE status = ?
  `);

  return stmt.all(status) as Draft[];
}

export function getDraftsBySiteAndStatus(
  db: Database.Database,
  site: string,
  status: string
): Draft[] {
  const stmt = db.prepare(`
    SELECT * FROM drafts WHERE site = ? AND status = ?
  `);

  return stmt.all(site, status) as Draft[];
}

export function updateDraftStatus(
  db: Database.Database,
  id: number,
  status: string,
  error?: string
): Database.RunResult {
  const now = new Date().toISOString();

  if (status === 'sent') {
    const stmt = db.prepare(`
      UPDATE drafts SET status = ?, sentAt = ?, error = ? WHERE id = ?
    `);
    return stmt.run(status, now, error || null, id);
  } else if (status === 'approved') {
    const stmt = db.prepare(`
      UPDATE drafts SET status = ?, approvedAt = ? WHERE id = ?
    `);
    return stmt.run(status, now, id);
  } else {
    const stmt = db.prepare(`
      UPDATE drafts SET status = ?, error = ? WHERE id = ?
    `);
    return stmt.run(status, error || null, id);
  }
}

export function checkRecentDraft(
  db: Database.Database,
  threadId: string,
  site: string,
  hoursAgo: number = 24
): Draft | undefined {
  const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

  const stmt = db.prepare(`
    SELECT * FROM drafts
    WHERE threadId = ? AND site = ? AND createdAt > ?
    AND status IN ('pending', 'sent', 'approved')
    ORDER BY createdAt DESC
    LIMIT 1
  `);

  return stmt.get(threadId, site, cutoff) as Draft | undefined;
}
