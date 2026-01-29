import { Message } from '@web-agent/core';

export function trimThreadContext(
  messages: Message[],
  maxMessages = 5,
  maxCharsPerMessage = 500
): Message[] {
  // Take last N messages
  const recent = messages.slice(-maxMessages);

  // Truncate each message
  return recent.map((msg) => ({
    ...msg,
    text: stripHtml(msg.text).slice(0, maxCharsPerMessage),
  }));
}

export function stripHtml(html: string): string {
  // Basic HTML stripping - remove tags and decode entities
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
