import { EventEmitter } from 'events';
import mongoose from 'mongoose';
export interface WebhooksManager extends EventEmitter {
    client: any;
    port: number;
    options: {
        /**
         * The client protocol, either 'discordjs' or 'eris'
         */
        protocol: 'discordjs' | 'eris';
        /**
         * The database type, either 'mongoose' or 'sqlite3'
         */
        database: 'mongoose' | 'sqlite3' | 'none';
        /**
         * The MongoDB connection string
         */
        connectionString: string;
        extra: null | {
            extraProtection: boolean;
            proxyTrust: boolean;
            shardedClient: boolean;
        };
        extraLogging: boolean;
    };
    db: mongoose.Connection | any;
    ready: boolean;
}
/**
 * The Webhook Manager Class for configuration
 * @example
 * ```js
 * import { WebhooksManager } from "blwebhooks";
 *
 * const manager = new WebhooksManager(client, PORT, {
 *   database: "mongoose", // mongoose or sqlite
 *   protocol: 'discordjs',
 *   connectionString: 'MongooseURL', // Only Use This If The Database Is Set To Mongoose
 *   extra: {
 *     proxyTrust: true, // Use if behind a proxy
 *     shardedClient: true, // Use if behind a sharded client
 *     extraProtection: true // Use for enhanced security features (Will require more RAM)
 *   }
 * });
 *
 * client.voteManager = manager; // Attach the manager to the discord client
 * ```
 *
 * @param client - The Discord.js v14 client instance.
 * @param options - Configuration options for the WebhooksManager.
 * @param options.database - The database type to use ("mongoose" or "sqlite").
 * @param options.connectionString - The connection string for the database.
 * @param options.protocol - The protocol to use ("discordjs" or "eris").
 * @param options.port - The port for the Express webserver.
 * @param options.extra - Additional storage options.
 * @param options.extra.proxyTrust - Set to true if behind a proxy.
 * @param options.extra.shardedClient - Set to true if using a sharded client.
 * @param options.extra.extraProtection - Enable enhanced security features (requires more RAM).
 *
 * @since 1.0.3
 */
export declare class WebhooksManager extends EventEmitter {
    client: any;
    port: number;
    options: {
        /**
         * The client protocol, either 'discordjs' or 'eris'
         */
        protocol: 'discordjs' | 'eris';
        /**
         * The database type, either 'mongoose' or 'sqlite3'
         */
        database: 'mongoose' | 'sqlite3' | 'none';
        /**
         * The MongoDB connection string
         */
        connectionString: string;
        /**
         * Storage options for extra configuration
         */
        extra: null | {
            extraProtection: boolean;
            proxyTrust: boolean;
            shardedClient: boolean;
        };
        /**
         * Enable extra logging
         */
        extraLogging: boolean;
    };
    db: mongoose.Connection | any;
    /**
     * Indicates whether the manager is ready
     */
    ready: boolean;
    /**
     * @param {Discord.Client} client The Discord Client
     * @param {Express.Port} port The port of the webserver
     */
    constructor(client: any, port: any, options: Partial<{
        storage: null;
        extraLogging: boolean;
        extra: {
            extraProtection: boolean;
            proxyTrust: boolean;
            shardedClient: boolean;
        };
    }>, init?: boolean);
    shardedClient(toggle: boolean): Promise<void>;
    /**
     * @example
     * ```js
     * await voteManager.setStroage('mongoose', 'MongooseURL');
     * ```
     */
    setStroage(DB: string, connectionString: string): Promise<void>;
    /**
     * @example
     * ```js
     * await voteManager.setLogging(true);
     * ```
     */
    setLogging(toggle: boolean): Promise<import("express-serve-static-core").Express | undefined>;
    /**
     * @example
     * ```js
     * await voteManager.extraProtection(true);
     * ```
     */
    extraProtection(toggle: boolean): Promise<import("express-serve-static-core").Express | undefined>;
    /**
     * @example
     * ```js
     * await voteManager.proxyTrust(true);
     * ```
     */
    proxyTrust(toggle: boolean): Promise<void>;
    /**
     * @example
     * ```js
     * await voteManager.testVote('userID', 'botID');
     * ```
     */
    testVote(userID: string, botID: string): Promise<void>;
    /**
     * @example
     * ```js
     * const server = await voteManager.getServer('serverID');
     * ```
     */
    getServer(serverID: string): Promise<any>;
    private updateVoteCount;
    /**
     * @example
     * ```js
     * await voteManager.topggVoteHook('url', 'auth', true);
     * ```
     */
    topggVoteHook(url: string, auth: string, toggle: boolean): Promise<void>;
    /**
     * @example
     * ```js
     * const client = discord.Client();
     * const { WebhooksManager } = require("blwebhooks");
     *
     * const voteClient = new WebhooksManager(client, 80);
     * client.voteManager = voteClient;
     *
     * voteClient.IBLVoteHook("IBLHook", "LOADS_OF_RANDOMNESS", true);
     * ```
     */
    IBLVoteHook(url: string, auth: string, toggle: boolean): Promise<void>;
    /**
     * @deprecated Legacy API
     */
    PBLVoteHook(url: any, auth: any, toggle: boolean): Promise<void>;
    VoidBotsVoteHook(url: string, auth: string, toggle: boolean): Promise<void>;
    DiscordLabsVoteHook(url: string, auth: string, toggle: boolean): Promise<void>;
    BListVoteHook(url: string, auth: string, toggle: boolean): Promise<void>;
    MYBVoteHook(url: string, auth: string, toggle: boolean): Promise<void>;
    DBCVoteHook(url: string, auth: string, toggle: boolean): Promise<void>;
    /**
     * Get the number of votes for a user
     * @param {string} userID - The ID of the user
     * @param {string} option - The time period for votes ('total', 'daily', 'weekly', 'monthly')
     * @returns {Promise<number>} The number of votes for the specified period
     * @throws {Error} If an invalid option is provided or if userID is missing
     * @example
     * ```js
     * const totalVotes = await voteManager.getVotes('123456789', 'total');
     * console.log(`Total votes: ${totalVotes}`);
     * ```
     */
    getVotes(userID: string, option: string): Promise<number>;
    /**
     * Inits the manager
     * @private
     */
    _init(): Promise<import("express-serve-static-core").Express | undefined>;
}
