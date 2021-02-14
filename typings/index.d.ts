declare const express: any;
declare const app: any;
declare const bodyParser: any;
declare const helmet: any;
declare const discord: any;
declare const slowDown: any;
declare const rateLimit: any;
declare const chalk: any;
declare const EventEmitter: any;
declare const speedLimiter: any;
declare const limiter: any;
/**
 * Webhook Manager
 */
declare class WebhooksManager extends EventEmitter {
    /**
     * @param {Discord.Client} client The Discord Client
     * @param {Express.Port} Webserver port
     */
    constructor(client: any, port: any);
    shardedClient(toggle: any): Promise<void>;
    setLogging(toggle: any): Promise<void>;
    extraProtection(toggle: any): Promise<any>;
    proxyTrust(toggle: any): Promise<any>;
    refreshStorage(): Promise<boolean>;
    testVote(userID: any, botID: any): Promise<void>;
    topggVoteHook(url: any, auth: any, toggle: any): Promise<void>;
    IBLVoteHook(url: any, auth: any, toggle: any): Promise<void>;
    VoidBotsVoteHook(url: any, auth: any, toggle: any): Promise<void>;
    DiscordLabsVoteHook(url: any, auth: any, toggle: any): Promise<void>;
    BotrixVoteHook(url: any, auth: any, toggle: any): Promise<void>;
    BListVoteHook(url: any, auth: any, toggle: any): Promise<void>;
}
