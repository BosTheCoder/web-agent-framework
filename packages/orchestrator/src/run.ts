import { SiteAdapter } from '@web-agent/core';
import Database from 'better-sqlite3';
import pino from 'pino';
import { insertDraft, checkRecentDraft } from './db/queries.js';
import { draftReply } from './llm/claude-cli.js';
import { trimThreadContext, delay } from './utils.js';

const logger = pino({ name: 'orchestrator' });

export interface RunOptions {
  site: string;
  adapter: SiteAdapter;
  db: Database.Database;
  dryRun?: boolean;
  maxThreads?: number;
  readDelayMs?: number;
}

export interface RunResult {
  threadsProcessed: number;
  draftsCreated: number;
  errors: string[];
}

export async function run(options: RunOptions): Promise<RunResult> {
  const {
    site,
    adapter,
    db,
    dryRun = true,
    maxThreads = 10,
    readDelayMs = 2000,
  } = options;

  logger.info({ site, dryRun, maxThreads }, 'Starting orchestrator run');

  const result: RunResult = {
    threadsProcessed: 0,
    draftsCreated: 0,
    errors: [],
  };

  try {
    // Fetch unread threads
    logger.info('Fetching unread threads');
    const threads = await adapter.listUnreadThreads();
    logger.info({ count: threads.length }, 'Fetched unread threads');

    // Limit to maxThreads
    const threadsToProcess = threads.slice(0, maxThreads);

    for (const thread of threadsToProcess) {
      try {
        // Check if we've already handled this thread recently
        const recent = checkRecentDraft(db, thread.threadId, site, 24);
        if (recent) {
          logger.info(
            { threadId: thread.threadId, status: recent.status },
            'Skipping recently handled thread'
          );
          continue;
        }

        // Read thread details
        logger.info({ threadId: thread.threadId }, 'Reading thread');
        const threadDetail = await adapter.readThread(thread.threadId);

        // Trim context
        const trimmedMessages = trimThreadContext(threadDetail.messages);

        // Draft reply
        logger.info({ threadId: thread.threadId }, 'Drafting reply');
        const draftResult = await draftReply({
          threadId: thread.threadId,
          messages: trimmedMessages,
        });

        // Insert into database
        if (draftResult.success) {
          insertDraft(db, {
            threadId: thread.threadId,
            site,
            draftText: draftResult.draft,
            confidence: draftResult.confidence,
            requiresReview: draftResult.confidence === 'low',
          });
          result.draftsCreated++;
        } else {
          insertDraft(db, {
            threadId: thread.threadId,
            site,
            draftText: `[DRAFT FAILED] ${draftResult.rawOutput}`,
            confidence: 'low',
            requiresReview: true,
          });
          result.errors.push(`Thread ${thread.threadId}: ${draftResult.error}`);
        }

        result.threadsProcessed++;

        // Rate limiting delay
        await delay(readDelayMs);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        logger.error({ threadId: thread.threadId, error: errorMsg }, 'Error processing thread');
        result.errors.push(`Thread ${thread.threadId}: ${errorMsg}`);
      }
    }

    logger.info(result, 'Orchestrator run complete');
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ error: errorMsg }, 'Fatal error in orchestrator run');
    result.errors.push(`Fatal: ${errorMsg}`);
    return result;
  }
}
