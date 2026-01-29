import { describe, it, expect, beforeEach } from 'vitest';
import { initDatabase, insertDraft, getDraftsByStatus } from '../queries.js';
import Database from 'better-sqlite3';

describe('Database Operations', () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(':memory:');
    initDatabase(db);
  });

  it('should insert draft successfully', () => {
    const draft = {
      threadId: 'thread-123',
      site: 'test-site',
      draftText: 'Hello, this is a test reply',
      confidence: 'medium',
      requiresReview: true,
    };

    const result = insertDraft(db, draft);
    expect(result.changes).toBe(1);
  });

  it('should retrieve drafts by status', () => {
    insertDraft(db, {
      threadId: 'thread-1',
      site: 'test-site',
      draftText: 'Reply 1',
      confidence: 'high',
      requiresReview: false,
    });

    const drafts = getDraftsByStatus(db, 'pending');
    expect(drafts).toHaveLength(1);
    expect(drafts[0].threadId).toBe('thread-1');
  });
});
