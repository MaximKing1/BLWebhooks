/**
 * Default manager configuration for the client instance
 * @since 1.0.0
 */
export interface ManagerConfig {
  storage: null | string;
  extraLogging: boolean;
  protocol: 'discordjs' | 'eris';
  extra: {
    extraProtection: boolean;
    proxyTrust: boolean;
    shardedClient: boolean;
  };
}

export const defaultManager: ManagerConfig = {
  storage: null,
  extraLogging: false,
  protocol: 'discordjs',
  extra: {
    extraProtection: true,
    proxyTrust: false,
    shardedClient: false
  }
};