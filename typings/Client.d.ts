/**
 * Webhook Manager
 */
export class WebhooksManager {
    /**
     * @param {Discord.Client} client The Discord Client
     * @param {Express.Port} Webserver port
     */
    constructor(client: any, port: any);
    /**
     * The Discord Client
     * @type {discord.Client}
    */
    client: any;
    /**
     * The Port
     * @type {Express.Port}
    */
    port: any;
    shardedClient(toggle: any): Promise<void>;
    setStroage(DB: any, string: any): Promise<void>;
    db: any;
    setLogging(toggle: any): Promise<any>;
    extraProtection(toggle: any): Promise<any>;
    proxyTrust(toggle: any): Promise<any>;
    testVote(userID: any, botID: any): Promise<void>;
    getServer(serverID: any): Promise<any>;
    topggVoteHook(url: any, auth: any, toggle: any): Promise<void>;
    IBLVoteHook(url: any, auth: any, toggle: any): Promise<void>;
    VoidBotsVoteHook(url: any, auth: any, toggle: any): Promise<void>;
    DiscordLabsVoteHook(url: any, auth: any, toggle: any): Promise<void>;
    BotrixVoteHook(url: any, auth: any, toggle: any): Promise<void>;
    BListVoteHook(url: any, auth: any, toggle: any): Promise<void>;
    MYBVoteHook(url: any, auth: any, toggle: any): Promise<void>;
    DBCVoteHook(url: any, auth: any, toggle: any): Promise<void>;
    getVotes(userID: any, option: any): Promise<void>;
}