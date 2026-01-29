import { Browser, BrowserContext } from 'playwright';
import { Session } from '../session/index.js';
import pino from 'pino';
import fs from 'fs/promises';
import path from 'path';

const logger = pino({ name: 'browser-context' });

export async function createAuthenticatedContext(
  browser: Browser,
  session: Session
): Promise<BrowserContext> {
  logger.info({ site: session.site, mode: session.mode }, 'Creating authenticated context');

  if (session.mode === 'storage') {
    const { storageStatePath } = session.config;
    if (!storageStatePath) {
      throw new Error('storageStatePath required for storage mode');
    }

    // Check if storage state file exists
    try {
      await fs.access(storageStatePath);
      logger.info({ path: storageStatePath }, 'Loading storage state');

      return await browser.newContext({
        storageState: storageStatePath,
      });
    } catch (error) {
      logger.warn({ path: storageStatePath }, 'Storage state not found, creating new context');
      return await browser.newContext();
    }
  } else if (session.mode === 'profile') {
    const { profilePath } = session.config;
    if (!profilePath) {
      throw new Error('profilePath required for profile mode');
    }

    // For profile mode, we need to launch with userDataDir
    // This requires re-launching the browser, so we'll document this limitation
    logger.info(
      { path: profilePath },
      'Profile mode requires browser launch with userDataDir - use launchBrowserWithProfile'
    );

    return await browser.newContext();
  }

  throw new Error(`Unknown auth mode: ${session.mode}`);
}

export async function saveStorageState(
  context: BrowserContext,
  storageStatePath: string
): Promise<void> {
  logger.info({ path: storageStatePath }, 'Saving storage state');

  // Ensure directory exists
  await fs.mkdir(path.dirname(storageStatePath), { recursive: true });

  await context.storageState({ path: storageStatePath });
  logger.info('Storage state saved successfully');
}
