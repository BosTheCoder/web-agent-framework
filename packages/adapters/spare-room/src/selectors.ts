/**
 * SpareRoom selectors
 *
 * TODO: Update these selectors based on actual SpareRoom UI
 * Prefer role/text selectors over CSS when possible
 */

export const SELECTORS = {
  // Navigation
  messagesLink: 'a[href*="/messages"]', // TODO: Use role="link", name="Messages" if available

  // Messages list
  unreadThreads: '.message-thread.unread', // TODO: Verify actual class names
  threadLink: 'a.thread-link', // TODO: Update with actual selector
  threadPreview: '.thread-preview', // TODO: Update with actual selector
  threadTimestamp: '.thread-timestamp', // TODO: Update with actual selector

  // Thread detail
  messageContainer: '.messages-container', // TODO: Update with actual selector
  messageItem: '.message-item', // TODO: Update with actual selector
  messageSender: '.message-sender', // TODO: Update with actual selector
  messageText: '.message-text', // TODO: Update with actual selector
  messageTimestamp: '.message-timestamp', // TODO: Update with actual selector

  // Reply
  replyTextarea: 'textarea[name="reply"]', // TODO: Update with actual selector
  sendButton: 'button[type="submit"]', // TODO: Use role="button", name="Send" if available
} as const;
