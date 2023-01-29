/**
 * @default defaultManager The default manager configuration for the client instance
 * 
 * @template
 * @since 1.0.0
 */
export const defaultManager = {
  storage: null,
  extraLogging: false,
  protocol: 'discordjs',
  extra: {
    extraProtection: true,
    proxyTrust: false,
    shardedClient: false
  }
};
