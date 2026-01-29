import { SiteAdapter, Thread, ThreadDetail } from '@web-agent/core';
import { BrowserContext, Page } from 'playwright';
import pino from 'pino';

const logger = pino({ name: 'spare-room-adapter' });

export class SpareRoomAdapter implements SiteAdapter {
  private context: BrowserContext;
  private page?: Page;

  constructor(context: BrowserContext) {
    this.context = context;
  }

  async listUnreadThreads(): Promise<Thread[]> {
    logger.info('Listing unread threads');

    this.page = await this.context.newPage();

    try {
      // TODO: Implement actual scraping logic
      // await navigateToMessages(this.page);
      // const threads = await this.page.$$eval(SELECTORS.unreadThreads, (elements) => {
      //   return elements.map((el) => ({
      //     threadId: el.getAttribute('data-thread-id') || '',
      //     preview: el.querySelector('.thread-preview')?.textContent || '',
      //     timestamp: new Date(el.querySelector('.thread-timestamp')?.textContent || ''),
      //   }));
      // });
      // return threads;

      throw new Error('Not implemented - update with actual SpareRoom scraping logic');
    } catch (error) {
      logger.error({ error }, 'Error listing threads');
      throw error;
    }
  }

  async readThread(threadId: string): Promise<ThreadDetail> {
    logger.info({ threadId }, 'Reading thread');

    if (!this.page) {
      this.page = await this.context.newPage();
    }

    try {
      // TODO: Implement actual scraping logic
      // await navigateToThread(this.page, threadId);
      // const messages = await this.page.$$eval(SELECTORS.messageItem, (elements) => {
      //   return elements.map((el) => ({
      //     from: el.querySelector('.message-sender')?.textContent || '',
      //     text: el.querySelector('.message-text')?.textContent || '',
      //     timestamp: new Date(el.querySelector('.message-timestamp')?.textContent || ''),
      //   }));
      // });
      // return { threadId, messages };

      throw new Error('Not implemented - update with actual SpareRoom thread reading logic');
    } catch (error) {
      logger.error({ threadId, error }, 'Error reading thread');
      throw error;
    }
  }

  async sendReply(threadId: string, _text: string): Promise<void> {
    logger.info({ threadId }, 'Sending reply');

    if (!this.page) {
      this.page = await this.context.newPage();
    }

    try {
      // TODO: Implement actual send logic
      // await navigateToThread(this.page, threadId);
      // await this.page.fill(SELECTORS.replyTextarea, text);
      // await this.page.click(SELECTORS.sendButton);
      // await this.page.waitForLoadState('networkidle');

      throw new Error('Not implemented - update with actual SpareRoom send logic');
    } catch (error) {
      logger.error({ threadId, error }, 'Error sending reply');
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
  }
}
