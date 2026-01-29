import { Command } from 'commander';
import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { chromium } from 'playwright';
import { createSession, createAuthenticatedContext } from '@web-agent/core';
import { run, initDatabase } from '@web-agent/orchestrator';
import { SpareRoomAdapter } from '@web-agent/adapter-spare-room';
import { BrowserContext } from 'playwright';

export const runCommand = new Command('run')
  .description('Run orchestrator for a site')
  .requiredOption('--site <site>', 'Site name (e.g., spare-room)')
  .option('--dry-run', 'Dry run mode (no sends)', true)
  .option('--max-threads <n>', 'Max threads to process', '10')
  .option('--auth-mode <mode>', 'Auth mode: storage or profile', 'storage')
  .action(async (options) => {
    const { site, dryRun, maxThreads, authMode } = options;

    console.log(`Running orchestrator for ${site}`);
    console.log(`Mode: ${dryRun ? 'DRY-RUN' : 'LIVE'}`);

    // Initialize database
    await mkdir('data', { recursive: true });
    const dbPath = join('data', 'web-agent.db');
    const db = new Database(dbPath);
    initDatabase(db);

    // Create session
    const session = await createSession({
      mode: authMode,
      site,
      storageStatePath:
        authMode === 'storage' ? join('.secrets', `${site}.storageState.json`) : undefined,
      profilePath: authMode === 'profile' ? join('.secrets', 'profiles', site) : undefined,
      headless: true,
    });

    // Launch browser
    const browser = await chromium.launch({ headless: true });
    const context = await createAuthenticatedContext(browser, session);

    // Get adapter
    const adapter = getAdapter(site, context);

    // Run orchestrator
    const result = await run({
      site,
      adapter,
      db,
      dryRun,
      maxThreads: parseInt(maxThreads, 10),
    });

    await browser.close();
    db.close();

    console.log('\nRun complete');
    console.log(`  Threads processed: ${result.threadsProcessed}`);
    console.log(`  Drafts created: ${result.draftsCreated}`);
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.length}`);
      result.errors.forEach((err) => console.log(`    - ${err}`));
    }
  });

function getAdapter(site: string, context: BrowserContext) {
  if (site === 'spare-room') {
    return new SpareRoomAdapter(context);
  }

  throw new Error(`Unknown site: ${site}`);
}
