import { Command } from 'commander';
import Database from 'better-sqlite3';
import { join } from 'path';
import { chromium, BrowserContext } from 'playwright';
import { createSession, createAuthenticatedContext } from '@web-agent/core';
import { sendApprovedReplies } from '@web-agent/orchestrator';
import { SpareRoomAdapter } from '@web-agent/adapter-spare-room';

export const sendCommand = new Command('send')
  .description('Send approved replies from review file')
  .requiredOption('--site <site>', 'Site name')
  .requiredOption('--review-file <path>', 'Path to review file')
  .option('--auth-mode <mode>', 'Auth mode: storage or profile', 'storage')
  .action(async (options) => {
    const { site, reviewFile, authMode } = options;

    console.log(`Sending approved replies for ${site}`);
    console.log(`Review file: ${reviewFile}`);

    // Confirm before proceeding
    console.log('\nThis will send actual messages. Continue? (y/N)');
    const confirmation = await new Promise<string>((resolve) => {
      process.stdin.once('data', (data) => resolve(data.toString().trim()));
    });

    if (confirmation.toLowerCase() !== 'y') {
      console.log('Aborted');
      return;
    }

    const dbPath = join('data', 'web-agent.db');
    const db = new Database(dbPath);

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

    // Send replies
    const result = await sendApprovedReplies({
      site,
      adapter,
      db,
      reviewFilePath: reviewFile,
    });

    await browser.close();
    db.close();

    console.log('\nSend complete');
    console.log(`  Sent: ${result.sent}`);
    console.log(`  Failed: ${result.failed}`);
    if (result.errors.length > 0) {
      console.log('  Errors:');
      result.errors.forEach((err: string) => console.log(`    - ${err}`));
    }
  });

function getAdapter(site: string, context: BrowserContext) {
  if (site === 'spare-room') {
    return new SpareRoomAdapter(context);
  }

  throw new Error(`Unknown site: ${site}`);
}
