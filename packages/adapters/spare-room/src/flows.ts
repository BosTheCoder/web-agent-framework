import { Page } from 'playwright';
import pino from 'pino';

const logger = pino({ name: 'spare-room-flows' });

export async function navigateToMessages(_page: Page): Promise<void> {
  logger.info('Navigating to messages');

  // TODO: Implement actual navigation
  // await page.click(SELECTORS.messagesLink);
  // await page.waitForSelector(SELECTORS.unreadThreads, { timeout: 10000 });

  throw new Error('Not implemented - update with actual SpareRoom navigation');
}

export async function navigateToThread(_page: Page, threadId: string): Promise<void> {
  logger.info({ threadId }, 'Navigating to thread');

  // TODO: Implement actual navigation
  // await page.click(`${SELECTORS.threadLink}[data-thread-id="${threadId}"]`);
  // await page.waitForSelector(SELECTORS.messageContainer, { timeout: 10000 });

  throw new Error('Not implemented - update with actual SpareRoom thread navigation');
}
