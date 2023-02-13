/// <reference types="node" />
import { EventEmitter } from "events";
export interface WebhooksManager extends EventEmitter {
    client: any;
    port: any;
    options: {
        /**
         * @param protocol The client either 'discordjs' or 'eris'
        */
        protocol: string;
        /**
         * @param database Either 'mongoose' or 'sqlite3'
        */
        database: string;
        /**
         * @param string THe MongoDB connection string
        */
        string(string: any, arg1: {
            useNewUrlParser: boolean;
            useUnifiedTopology: boolean;
            useFindAndModify: boolean;
            useCreateIndex: boolean;
        }): unknown;
        storage: null;
        extraLogging: boolean;
        extra: {
            extraProtection: boolean;
            proxyTrust: boolean;
            shardedClient: boolean;
        };
    };
    db: any;
    ready: boolean;
}
/**
 * The Webhook Manager Class for configuration
 *  ```js
 * import { WebhooksManager } from "blwebhooks";
 *
 * const manager = WebhooksManager(client, {
 *   database: "mongoose", // mongoose or sqlite
 *   port: "80",
 *   storage: {
 *     proxyTrust: true, // Use if behind a proxy
 *     shardedClient: true, // Use if behind a sharded client
 *     extraProtection: true // Use for the enhanced security features (Will require more RAM)
 *   }
 * });
 *
 * client.voteManager = manager;
 *
 *
 * @param client The client param is the discord.js v14 client instance.
 * @param port The port param is used to define the express webserver port.
 * @param options The options param is used to define the database options, and other settings.
 *
 * @since 1.0.3
 */
export declare class WebhooksManager extends EventEmitter {
    client: any;
    port: any;
    options: {
        /**
         * @param protocol The client either 'discordjs' or 'eris'
        */
        protocol: string;
        /**
         * @param database Either 'mongoose' or 'sqlite3'
        */
        database: string;
        /**
         * @param string The MongoDB connection string
        */
        string(string: any, arg1: {
            useNewUrlParser: boolean;
            useUnifiedTopology: boolean;
            useFindAndModify: boolean;
            useCreateIndex: boolean;
        }): unknown;
        /**
         * @param storage The storage options can be used to set extraProtection, proxyTrust and shardedClient options.
         *
         * @example
         *  ```js
         * import { WebhooksManager } from "blwebhooks";
    
         * const manager = WebhooksManager(client, {
         *   database: "mongoose", // mongoose or sqlite
         *   port: "80",
         *   storage: {
         *     proxyTrust: true, // Use if behind a proxy
         *     shardedClient: true, // Use if behind a sharded client
         *     extraProtection: true // Use for the enhanced security features (Will require more RAM)
         *   }
         * });
         *
         * client.voteManager = manager;
         *   ```
         *
        */
        storage: null;
        extraLogging: boolean;
        extra: {
            extraProtection: boolean;
            proxyTrust: boolean;
            shardedClient: boolean;
        };
    };
    db: any;
    /**
     * @returns
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
    setStroage(DB: string, string: string): Promise<void>;
    setLogging(toggle: boolean): Promise<import("express-serve-static-core").Express | undefined>;
    extraProtection(toggle: boolean): Promise<import("express-serve-static-core").Express | undefined>;
    proxyTrust(toggle: boolean): Promise<void>;
    testVote(userID: string, botID: string): Promise<void>;
    getServer(serverID: string): Promise<any>;
    topggVoteHook(url: any, auth: any, toggle: boolean): Promise<void>;
    /**
   * @example
const client = discord.Client();
const { WebhooksManager } = require("blwebhooks");

const voteClient = new WebhooksManager(client, 80);
client.voteManager = voteClient;

voteClient.IBLVoteHook("IBLHook", "LOADS_OF_RANDOMNESS", true);
   */
    IBLVoteHook(url: any, auth: any, toggle: boolean): Promise<void>;
    /**
     * @deprecated Legacy API
     */
    PBLVoteHook(url: any, auth: any, toggle: boolean): Promise<void>;
    VoidBotsVoteHook(url: any, auth: any, toggle: boolean): Promise<void>;
    DiscordLabsVoteHook(url: any, auth: any, toggle: boolean): Promise<void>;
    BListVoteHook(url: any, auth: any, toggle: boolean): Promise<void>;
    MYBVoteHook(url: any, auth: any, toggle: boolean): Promise<void>;
    DBCVoteHook(url: any, auth: any, toggle: boolean): Promise<void>;
    getVotes(userID: any, option: string): Promise<void>;
    /**
     * Inits the manager
     * @private
     */
    _init(): Promise<import("express-serve-static-core").Express | undefined>;
}
