"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksManager = void 0;
// Import required modules
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = require("body-parser");
const express_slow_down_1 = __importDefault(require("express-slow-down"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const chalk_1 = __importDefault(require("chalk"));
const deepmerge_1 = __importDefault(require("deepmerge"));
const events_1 = require("events");
const errorhandler_1 = __importDefault(require("errorhandler"));
const mongoose_1 = __importDefault(require("mongoose"));
const Constants_1 = require("./Constants");
const vote_1 = __importDefault(require("./models/vote"));
const sdk_1 = __importDefault(require("@top-gg/sdk"));
// Initialize Express application
const app = (0, express_1.default)();
// Configure speed limiter
const speedLimiter = (0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 250, // Start delaying after 250 requests
    delayMs: () => 400, // Delay each request by 400ms
    message: 'Too many requests from this IP, please try again later.',
});
// Configure rate limiter
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 250, // Limit each IP to 250 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
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
class WebhooksManager extends events_1.EventEmitter {
    /**
     * @param {Discord.Client} client The Discord Client
     * @param {Express.Port} port The port of the webserver
     */
    constructor(client, port, options, init = true) {
        super();
        /**
         * Indicates whether the manager is ready
         */
        this.ready = false;
        console.log(chalk_1.default.red('━━━━━━━━━━━━━━━━━━━━━━━'));
        console.log(chalk_1.default.yellow('Important Notice:'));
        console.log(chalk_1.default.cyan('Manager options have been updated.'));
        console.log(chalk_1.default.cyan('Please review our documentation at:'));
        console.log(chalk_1.default.blue('https://github.com/MaximKing1/BLWebhooks#readme'));
        console.log(chalk_1.default.red('━━━━━━━━━━━━━━━━━━━━━━━'));
        /**
         * The Discord Client
         * @type {discord.Client}
         */
        this.client = client;
        /**
         * The Port
         * @type {Express.Port}
         */
        this.port = port;
        /**
         * The manager options
         * @type {WebhooksManagerOptions}
         */
        // @ts-ignore
        this.options = (0, deepmerge_1.default)(Constants_1.defaultManager, options);
        if (!client) {
            // @ts-ignore
            return console.log(chalk_1.default.red('[BLWEBHOOKS] The client is not defined'));
        }
        else if (!port) {
            // @ts-ignore
            return console.log(chalk_1.default.red('[BLWEBHOOKS] The port is required!'));
        }
        else if (typeof port != 'number') {
            // @ts-ignore
            return console.log(chalk_1.default.red('[BLWEBHOOKS] The port is a number.'));
        }
        else if (client) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] The Client has connected to BLWebhooks'));
        }
        if (port) {
            app.listen(port);
            app.use((0, body_parser_1.json)());
            app.use(limiter);
            app.use(speedLimiter);
            app.use((0, cookie_parser_1.default)());
            console.log(chalk_1.default.green(`[BLWEBHOOKS] The Vote Webserver Has Started On Port ${port}.`));
        }
        if (init)
            this._init();
    }
    async shardedClient(toggle) {
        if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] Sharding client has been enabled.'));
        }
        else if (toggle == false) {
            console.log(chalk_1.default.red('[BLWEBHOOKS] Sharding client has been disabled.'));
        }
    }
    /**
     * @example
     * ```js
     * await voteManager.setStroage('mongoose', 'MongooseURL');
     * ```
     */
    async setStroage(DB, connectionString) {
        if (DB === 'mongoose') {
            console.log(chalk_1.default.yellow('[BLWEBHOOKS] Enabled mongoose database.'));
            try {
                await mongoose_1.default.connect(connectionString);
                console.log(chalk_1.default.green('[BLWEBHOOKS] Successfully connected to MongoDB.'));
            }
            catch (error) {
                console.error(chalk_1.default.red('[BLWEBHOOKS] Failed to connect to MongoDB:'), error);
            }
        }
        else if (DB == 'sqlite3') {
            var sqlite3 = require('sqlite3');
            this.db = new sqlite3.Database('blwebhooks.db', async (err) => {
                if (err) {
                    console.error(chalk_1.default.red(err.message));
                }
                console.log(chalk_1.default.yellow('[BLWEBHOOKS] Enabled SQLITE database.'));
                console.log(chalk_1.default.yellow('[BLWEBHOOKS] Connected to the blwebhooks.db database.'));
            });
        }
        else if (DB == 'mysql') {
            console.log(chalk_1.default.yellow('[BLWEBHOOKS - Beta] Enabled MySQL database Connection.'));
        }
    }
    /**
     * @example
     * ```js
     * await voteManager.setLogging(true);
     * ```
     */
    async setLogging(toggle) {
        if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] Advanced logging enabled.'));
            return app.use((0, errorhandler_1.default)());
        }
        else if (toggle == false) {
            console.log(chalk_1.default.red('[BLWEBHOOKS] Advance logging disabled'));
        }
    }
    /**
     * @example
     * ```js
     * await voteManager.extraProtection(true);
     * ```
     */
    async extraProtection(toggle) {
        if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] Extra protection enabled.'));
            return app.use((0, helmet_1.default)({
                contentSecurityPolicy: false,
                permittedCrossDomainPolicies: false,
            }));
        }
        else if (toggle == false) {
            console.log(chalk_1.default.red('[BLWEBHOOKS] Extra protection disabled.'));
        }
    }
    /**
     * @example
     * ```js
     * await voteManager.proxyTrust(true);
     * ```
     */
    async proxyTrust(toggle) {
        if (toggle) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] Proxy trust enabled.'));
            app.enable('trust proxy');
        }
        else {
            console.log(chalk_1.default.red('[BLWEBHOOKS] Proxy trust disabled.'));
            app.disable('trust proxy');
        }
    }
    /**
     * @example
     * ```js
     * await voteManager.testVote('userID', 'botID');
     * ```
     */
    async testVote(userID, botID) {
        const type = 'test';
        const list = 'Test';
        console.log(`${userID} voted for ${botID}`);
        // Emit events
        this.client.emit('vote', userID, botID, list);
        this.client.emit('topgg-voted', userID, botID, type);
        this.client.emit('IBL-voted', userID, botID, type);
        // Simulate vote expiration after 24 hours
        setTimeout(() => {
            this.client.emit('voteExpired', userID, botID, list);
        }, 1000 * 60 * 60 * 24);
    }
    /**
     * @example
     * ```js
     * const server = await voteManager.getServer('serverID');
     * ```
     */
    async getServer(serverID) {
        let server;
        if (this.options.protocol === 'discordjs') {
            server = await this.client.guilds.cache.get(serverID);
        }
        else if (this.options.protocol === 'eris') {
            server = this.client.guilds.get(serverID);
        }
        else {
            throw new Error('Invalid protocol specified');
        }
        return server;
    }
    async updateVoteCount(userID) {
        if (this.options.database === 'mongoose') {
            await vote_1.default.findOneAndUpdate({ userID: userID }, { $inc: { totalVotes: 1 } }, { upsert: true, new: true });
        }
        else if (this.options.database === 'sqlite3') {
            return new Promise((resolve, reject) => {
                this.db.run('INSERT OR REPLACE INTO user_votes (userID, totalVotes) VALUES (?, COALESCE((SELECT totalVotes FROM user_votes WHERE userID = ?) + 1, 1))', [userID, userID], (err) => {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        }
        // If no database is enabled, do nothing
    }
    /**
     * @example
     * ```js
     * await voteManager.topggVoteHook('url', 'auth', true);
     * ```
     */
    async topggVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red('[BLWEBHOOKS] Top.gg vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] Top.gg vote hooks have been enabled.'));
        }
        const WH = new sdk_1.default.Webhook(auth);
        app.post(`/${url}`, WH.middleware(), async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth) {
                console.log('Failed Access - Top.gg Endpoint');
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to use this endpoint. - Top.gg",
                }));
            }
            const userID = req.body.user;
            const botID = req.body.bot;
            const type = req.body.type;
            const List = 'top.gg';
            try {
                await this.updateVoteCount(userID);
                this.client.emit('topgg-voted', userID, botID, type);
                this.client.emit('vote', userID, botID, List);
                setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
                res.status(200).send(JSON.stringify({
                    error: false,
                    message: '[BLWEBHOOKS] Received the request!',
                }));
            }
            catch (error) {
                console.error('Error updating vote count:', error);
                res.status(500).send(JSON.stringify({
                    error: true,
                    message: '[BLWEBHOOKS] Internal server error',
                }));
            }
        });
    }
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
    async IBLVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red('[BLWEBHOOKS] InfinityBotList vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] InfinityBotList vote hooks have been enabled.'));
        }
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth) {
                console.log('Failed Access - InfinityBotList Endpoint');
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to use this endpoint. - InfinityBotList",
                }));
            }
            const userID = req.body.userID;
            const botID = req.body.botID;
            const type = req.body.type;
            const List = 'InfinityBotList';
            try {
                await this.updateVoteCount(userID);
                this.client.emit('IBL-voted', userID, botID, type);
                this.client.emit('vote', userID, botID, List);
                setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
                res.status(200).send(JSON.stringify({
                    error: false,
                    message: '[BLWEBHOOKS] Received the request!',
                }));
            }
            catch (error) {
                console.error('Error updating vote count:', error);
                res.status(500).send(JSON.stringify({
                    error: true,
                    message: '[BLWEBHOOKS] Internal server error',
                }));
            }
        });
    }
    /**
     * @deprecated Legacy API
     */
    async PBLVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red('[BLWEBHOOKS] ParaiseBots vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] ParaiseBots vote hooks have been enabled.'));
        }
        // @ts-ignore
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                console.log('Failed Access - ParaiseBots Endpoint');
            if (req.header('Authorization') != auth)
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to use this endpoint. - ParaiseBots",
                }));
            const userID = req.body.userID;
            const botID = req.body.bot;
            const userName = req.body.user;
            const type = null;
            const List = 'ParaiseBots';
            this.client.emit('PBL-voted', userID, botID, userName, type);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
            // Respond to IBL API
            res.status(200).send(JSON.stringify({
                error: false,
                message: '[BLWEBHOOKS] Received the request!',
            }));
        });
    }
    async VoidBotsVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red('[BLWEBHOOKS] Void Bots vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] Void Bots vote hooks have been enabled.'));
        }
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                console.log('Failed Access - VoidBots Endpoint');
            if (req.header('Authorization') != auth)
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to this endpoint - VoidBots",
                }));
            const userID = req.body.user;
            const botID = req.body.bot;
            const List = 'VoidBots';
            try {
                await this.updateVoteCount(userID);
                this.client.emit('VB-voted', userID, botID);
                this.client.emit('vote', userID, botID, List);
                setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
                res.status(200).send(JSON.stringify({
                    error: false,
                    message: '[BLWEBHOOKS] Received the request!',
                }));
            }
            catch (error) {
                console.error('Error updating vote count:', error);
                res.status(500).send(JSON.stringify({
                    error: true,
                    message: '[BLWEBHOOKS] Internal server error',
                }));
            }
        });
    }
    async DiscordLabsVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red('[BLWEBHOOKS] DiscordLabs vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] DiscordLabs Vote Hooks Enabled'));
        }
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                console.log('Failed Access - DiscordLabs Endpoint');
            if (req.header('Authorization') != auth)
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to use this endpoint - DiscordLabs",
                }));
            const userID = req.body.uid;
            const botID = req.body.bid;
            const wasTest = req.body.test;
            const List = 'DiscordLabs';
            try {
                await this.updateVoteCount(userID);
                this.client.emit('DL-voted', userID, botID, wasTest);
                this.client.emit('vote', userID, botID, List);
                setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
                res.status(200).send(JSON.stringify({
                    error: false,
                    message: '[BLWEBHOOKS] Received the request!',
                }));
            }
            catch (error) {
                console.error('Error updating vote count:', error);
                res.status(500).send(JSON.stringify({
                    error: true,
                    message: '[BLWEBHOOKS] Internal server error',
                }));
            }
        });
    }
    async BListVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red('[BLWEBHOOKS] BList vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] BList vote hooks have been enabled.'));
        }
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                console.log('Failed Access - BList Endpoint');
            if (req.header('Authorization') != auth)
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to use this endpoint - BList",
                }));
            const userID = req.body.user;
            const botID = null;
            const List = 'BList';
            try {
                await this.updateVoteCount(userID);
                this.client.emit('BLT-voted', userID);
                this.client.emit('vote', userID, botID, List);
                setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
                res.status(200).send(JSON.stringify({
                    error: false,
                    message: '[BLWEBHOOKS] Received the request!',
                }));
            }
            catch (error) {
                console.error('Error updating vote count:', error);
                res.status(500).send(JSON.stringify({
                    error: true,
                    message: '[BLWEBHOOKS] Internal server error',
                }));
            }
        });
    }
    async MYBVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red('[BLWEBHOOKS] MythicalBots vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] MythicalBots vote hooks have been enabled.'));
        }
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                console.log('Failed Access - Mythicalbots Endpoint');
            if (req.header('Authorization') != auth)
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to use this endpoint - Mythicalbots",
                }));
            const userID = req.body.user;
            const botID = null;
            const List = 'MythicalBots';
            try {
                await this.updateVoteCount(userID);
                this.client.emit('MYB-voted', userID);
                this.client.emit('vote', userID, botID, List);
                setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
                res.status(200).send(JSON.stringify({
                    error: false,
                    message: '[BLWEBHOOKS] Received the request!',
                }));
            }
            catch (error) {
                console.error('Error updating vote count:', error);
                res.status(500).send(JSON.stringify({
                    error: true,
                    message: '[BLWEBHOOKS] Internal server error',
                }));
            }
        });
    }
    async DBCVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red('[BLWEBHOOKS] DiscordBots.co vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] DiscordBots.co vote hooks have been enabled.'));
        }
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                console.log('Failed Access - DiscordBots.co Endpoint');
            if (req.header('Authorization') != auth)
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to use this endpoint - DiscordBots.co",
                }));
            // Use the data on whatever you want
            console.log(req.body);
            // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.userId;
            const botID = null;
            const List = 'DiscordBots.co';
            try {
                await this.updateVoteCount(userID);
                this.client.emit('DBC-voted', userID);
                this.client.emit('vote', userID, botID, List);
                setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
                res.status(200).send(JSON.stringify({
                    error: false,
                    message: '[BLWEBHOOKS] Received the request!',
                }));
            }
            catch (error) {
                console.error('Error updating vote count:', error);
                res.status(500).send(JSON.stringify({
                    error: true,
                    message: '[BLWEBHOOKS] Internal server error',
                }));
            }
        });
    }
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
    async getVotes(userID, option) {
        if (!userID) {
            throw new Error('Please provide a userID');
        }
        if (!option) {
            throw new Error('Please provide an option - total, daily, weekly, monthly');
        }
        const now = new Date();
        let startDate;
        switch (option) {
            case 'total':
                const user = await vote_1.default.findOne({ userID });
                return user ? user.totalVotes : 0;
            case 'daily':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'weekly':
                startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                break;
            case 'monthly':
                startDate = new Date(now.setDate(1));
                break;
            default:
                throw new Error('Invalid option. Please use total, daily, weekly, or monthly');
        }
        const voteCount = await vote_1.default.countDocuments({
            userID,
            createdAt: { $gte: startDate },
        });
        return voteCount;
    }
    /**
     * Inits the manager
     * @private
     */
    async _init() {
        var _a, _b, _c, _d, _e, _f;
        if (((_a = this.options.extra) === null || _a === void 0 ? void 0 : _a.proxyTrust) == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] Proxy trust enabled.'));
            return app.enable('trust proxy');
        }
        else if (((_b = this.options.extra) === null || _b === void 0 ? void 0 : _b.proxyTrust) == false) {
            console.log(chalk_1.default.red('[BLWEBHOOKS] Proxy trust disabled.'));
        } // Enable this if your behind a proxy, Heroku, Docker, Replit, etc
        if (((_c = this.options.extra) === null || _c === void 0 ? void 0 : _c.shardedClient) == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] Sharding client has been enabled.'));
        }
        else if (((_d = this.options.extra) === null || _d === void 0 ? void 0 : _d.shardedClient) == false) {
            console.log(chalk_1.default.red('[BLWEBHOOKS] Sharding client has been disabled.'));
        }
        if (this.options.extraLogging == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] Advanced logging enabled.'));
            return app.use((0, errorhandler_1.default)());
        }
        else if (this.options.extraLogging == false) {
            console.log(chalk_1.default.red('[BLWEBHOOKS] Advance logging disabled'));
        }
        if (this.options.database == 'mongoose') {
            console.log(chalk_1.default.yellow('[BLWEBHOOKS] Enabled mongoose database.'));
            try {
                await mongoose_1.default.connect(this.options.connectionString);
                console.log(chalk_1.default.green('[BLWEBHOOKS] Successfully connected to MongoDB.'));
            }
            catch (error) {
                console.error(chalk_1.default.red('[BLWEBHOOKS] Failed to connect to MongoDB:'), error);
            }
        }
        else if (this.options.database == 'sqlite3') {
            var sqlite3 = require('sqlite3').verbose();
            this.db = new sqlite3.Database('voteHooks.db');
            this.db.run(`
        CREATE TABLE IF NOT EXISTS user_votes (
          userID TEXT PRIMARY KEY,
          totalVotes INTEGER DEFAULT 0
        )
      `);
        }
        else if (this.options.database == 'none') {
            console.log(chalk_1.default.red('[BLWEBHOOKS] Database Disabled'));
        }
        if (((_e = this.options.extra) === null || _e === void 0 ? void 0 : _e.extraProtection) == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] Extra protection enabled.'));
            return app.use((0, helmet_1.default)({
                contentSecurityPolicy: false,
                permittedCrossDomainPolicies: false,
            }));
        }
        else if (((_f = this.options.extra) === null || _f === void 0 ? void 0 : _f.extraProtection) == false) {
            console.log(chalk_1.default.red('[BLWEBHOOKS] Extra protection disabled.'));
        }
        this.ready = true;
    }
}
exports.WebhooksManager = WebhooksManager;
