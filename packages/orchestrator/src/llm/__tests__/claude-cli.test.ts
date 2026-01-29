import { describe, it, expect } from 'vitest';
import { draftReply, DraftReplyInput } from '../claude-cli.js';

describe('Claude CLI Integration', () => {
  it('should parse valid JSON response', async () => {
    const input: DraftReplyInput = {
      threadId: 'thread-123',
      messages: [
        { from: 'Alice', text: 'Hello, is this still available?', timestamp: new Date() },
      ],
    };

    const result = await draftReply(input, {
      mockResponse: JSON.stringify({
        draft: 'Yes, still available!',
        tone: 'friendly',
        confidence: 'high',
        questions: [],
        should_send: false,
      }),
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.draft).toBe('Yes, still available!');
      expect(result.confidence).toBe('high');
    }
  });

  it('should handle invalid JSON gracefully', async () => {
    const input: DraftReplyInput = {
      threadId: 'thread-123',
      messages: [{ from: 'Alice', text: 'Hello', timestamp: new Date() }],
    };

    const result = await draftReply(input, {
      mockResponse: 'This is not valid JSON',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.requiresReview).toBe(true);
      expect(result.rawOutput).toBe('This is not valid JSON');
    }
  });
});
