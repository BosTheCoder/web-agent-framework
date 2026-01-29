import { describe, it, expect } from 'vitest';
import { createSession } from '../index.js';

describe('Session Management', () => {
  it('should create session with storage state mode', async () => {
    const config = {
      mode: 'storage' as const,
      site: 'test-site',
      storageStatePath: '.secrets/test.json',
    };

    const session = await createSession(config);
    expect(session).toBeDefined();
    expect(session.mode).toBe('storage');
  });

  it('should create session with profile mode', async () => {
    const config = {
      mode: 'profile' as const,
      site: 'test-site',
      profilePath: '.secrets/profiles/test',
    };

    const session = await createSession(config);
    expect(session).toBeDefined();
    expect(session.mode).toBe('profile');
  });
});
