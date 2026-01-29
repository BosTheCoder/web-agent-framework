import { Session, SessionConfig } from './types.js';

export async function createStorageStateSession(config: SessionConfig): Promise<Session> {
  if (!config.storageStatePath) {
    throw new Error('storageStatePath required for storage mode');
  }

  return {
    mode: 'storage',
    site: config.site,
    config,
  };
}
