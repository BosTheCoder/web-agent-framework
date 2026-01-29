export type AuthMode = 'storage' | 'profile';

export interface SessionConfig {
  mode: AuthMode;
  site: string;
  storageStatePath?: string;
  profilePath?: string;
  headless?: boolean;
}

export interface Session {
  mode: AuthMode;
  site: string;
  config: SessionConfig;
}
