import { SiteAdapter } from '@web-agent/core';
import Database from 'better-sqlite3';
import { readFile } from 'fs/promises';
import { parseReviewMarkdown } from './review.js';
import { updateDraftStatus } from './db/queries.js';
import { delay } from './utils.js';
import pino from 'pino';

const logger = pino({ name: 'send' });

export interface SendOptions {
  site: string;
  adapter: SiteAdapter;
  db: Database.Database;
  reviewFilePath: string;
  sendDelayMs?: number;
}

export interface SendResult {
  sent: number;
  failed: number;
  errors: string[];
}

export async function sendApprovedReplies(options: SendOptions): Promise<SendResult> {
  const { site, adapter, db, reviewFilePath, sendDelayMs = 5000 } = options;

  logger.info({ site, reviewFile: reviewFilePath }, 'Sending approved replies');

  const result: SendResult = {
    sent: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Read and parse review file
    const content = await readFile(reviewFilePath, 'utf-8');
    const approved = parseReviewMarkdown(content);

    logger.info({ count: approved.size }, 'Parsed approved drafts');

    // Get thread IDs from database
    const stmt = db.prepare('SELECT id, threadId FROM drafts WHERE id = ?');

    for (const [draftId, finalText] of approved.entries()) {
      try {
        const draft = stmt.get(draftId) as { id: number; threadId: string } | undefined;

        if (!draft) {
          logger.warn({ draftId }, 'Draft not found in database');
          continue;
        }

        // Mark as approved first
        updateDraftStatus(db, draftId, 'approved');

        // Send reply
        logger.info({ draftId, threadId: draft.threadId }, 'Sending reply');
        await adapter.sendReply(draft.threadId, finalText);

        // Mark as sent
        updateDraftStatus(db, draftId, 'sent');
        result.sent++;

        logger.info({ draftId }, 'Reply sent successfully');

        // Rate limiting delay
        await delay(sendDelayMs);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ draftId, error: errorMsg }, 'Error sending reply');

        updateDraftStatus(db, draftId, 'failed', errorMsg);
        result.failed++;
        result.errors.push(`Draft ${draftId}: ${errorMsg}`);
      }
    }

    logger.info(result, 'Send complete');
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: errorMsg }, 'Fatal error sending replies');
    result.errors.push(`Fatal: ${errorMsg}`);
    return result;
  }
}
