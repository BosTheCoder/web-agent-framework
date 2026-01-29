import { Thread, ThreadDetail } from './thread.js';

export interface SiteAdapter {
  /**
   * List unread message threads
   */
  listUnreadThreads(): Promise<Thread[]>;

  /**
   * Read full thread details
   */
  readThread(threadId: string): Promise<ThreadDetail>;

  /**
   * Send reply to thread
   */
  sendReply(threadId: string, text: string): Promise<void>;
}
