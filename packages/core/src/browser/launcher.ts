import { chromium, Browser } from 'playwright';
import pino from 'pino';

const logger = pino({ name: 'browser-launcher' });

export interface LaunchOptions {
  headless?: boolean;
  slowMo?: number;
}

export async function launchBrowser(options: LaunchOptions = {}): Promise<Browser> {
  logger.info({ options }, 'Launching browser');

  const browser = await chromium.launch({
    headless: options.headless ?? true,
    slowMo: options.slowMo ?? 0,
  });

  logger.info('Browser launched successfully');
  return browser;
}
