import { Session, SessionConfig } from './types.js';

export async function createPersistentProfileSession(config: SessionConfig): Promise<Session> {
  if (!config.profilePath) {
    throw new Error('profilePath required for profile mode');
  }

  return {
    mode: 'profile',
    site: config.site,
    config,
  };
}
