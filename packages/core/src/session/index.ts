import { Session, SessionConfig } from './types.js';
import { createStorageStateSession } from './storage-state.js';
import { createPersistentProfileSession } from './persistent-profile.js';

export * from './types.js';

export async function createSession(config: SessionConfig): Promise<Session> {
  if (config.mode === 'storage') {
    return createStorageStateSession(config);
  } else if (config.mode === 'profile') {
    return createPersistentProfileSession(config);
  }

  throw new Error(`Unknown auth mode: ${config.mode}`);
}
