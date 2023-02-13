/**
 * @default defaultManager The default manager configuration for the client instance
 *
 * @template
 * @since 1.0.0
 */
export declare const defaultManager: {
    storage: null;
    extraLogging: boolean;
    protocol: string;
    extra: {
        extraProtection: boolean;
        proxyTrust: boolean;
        shardedClient: boolean;
    };
};
