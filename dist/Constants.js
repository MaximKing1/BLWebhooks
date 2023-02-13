"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultManager = void 0;
/**
 * @default defaultManager The default manager configuration for the client instance
 *
 * @template
 * @since 1.0.0
 */
exports.defaultManager = {
    storage: null,
    extraLogging: false,
    protocol: 'discordjs',
    extra: {
        extraProtection: true,
        proxyTrust: false,
        shardedClient: false
    }
};
