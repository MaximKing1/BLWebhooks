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
    async setStroage(DB, string) {
        if (DB === 'mongoose') {
            console.log(chalk_1.default.yellow('[BLWEBHOOKS] Enabled mongoose database.'));
            mongoose_1.default.connect(string, {
                // @ts-ignore
                useUnifiedTopology: true,
                useFindAndModify: true,
                useCreateIndex: true,
            });
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
                // Update the user's vote count in the database
                await vote_1.default.findOneAndUpdate({ userID: userID }, { $inc: { totalVotes: 1 } }, { upsert: true, new: true });
                // Emit events
                this.client.emit('topgg-voted', userID, botID, type);
                this.client.emit('vote', userID, botID, List);
                // Set timeout for vote expiration
                setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
                // Respond to Top.gg API
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
            // Use the data on whatever you want
            console.log(req.body);
            const userID = req.body.userID;
            const botID = req.body.botID;
            const type = req.body.type;
            const List = 'InfinityBotList';
            try {
                // Update the user's vote count in the database
                await vote_1.default.findOneAndUpdate({ userID: userID }, { $inc: { totalVotes: 1 } }, { upsert: true, new: true });
                // Emit events
                this.client.emit('IBL-voted', userID, botID, type);
                this.client.emit('vote', userID, botID, List);
                // Set timeout for vote expiration
                setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
                // Respond to IBL API
                res.status(200).send(JSON.stringify({
                    error: false,
                    message: '[BLWEBHOOKS] Received the request!',
                }));
            }
            catch (error) {
                console.error('Error updating user vote count:', error);
                res.status(500).send(JSON.stringify({
                    error: true,
                    message: 'Error updating user vote count',
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
            // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
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
        // @ts-ignore
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
            // Use the data on whatever you want
            console.log(req.body);
            // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.user;
            const botID = req.body.bot;
            const List = 'VoidBots';
            this.client.emit('VB-voted', userID, botID);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
            // Respond to VoidBots API
            res.status(200).send(JSON.stringify({
                error: false,
                message: '[BLWEBHOOKS] Received the request!',
            }));
        });
    }
    async DiscordLabsVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red('[BLWEBHOOKS] DiscordLabs vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] DiscordLabs Vote Hooks Enabled'));
        }
        // @ts-ignore
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
            // Use the data on whatever you want
            console.log(req.body);
            // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.uid;
            const botID = req.body.bid;
            const wasTest = req.body.test;
            const List = 'DiscordLabs';
            this.client.emit('DL-voted', userID, botID, wasTest);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
            // Respond to DiscordLabs API
            res.status(200).send(JSON.stringify({
                error: false,
                message: '[BLWEBHOOKS] Received the request!',
            }));
        });
    }
    async BListVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red('[BLWEBHOOKS] BList vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] BList hote hooks have been enabled.'));
        }
        // @ts-ignore
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
            // Use the data on whatever you want
            console.log(req.body);
            // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.user;
            const botID = null;
            const List = 'BList';
            this.client.emit('BLT-voted', userID);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
            // Respond to BList API
            res.status(200).send(JSON.stringify({
                error: false,
                message: '[BLWEBHOOKS] Received the request!',
            }));
        });
    }
    async MYBVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red('[BLWEBHOOKS] BList vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] BList hote hooks have been enabled.'));
        }
        // @ts-ignore
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
            // Use the data on whatever you want
            console.log(req.body);
            // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.user;
            const botID = null;
            const List = 'MythicalBots';
            this.client.emit('MYB-voted', userID);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
            // Respond to Mythicalbots API
            res.status(200).send(JSON.stringify({
                error: false,
                message: '[BLWEBHOOKS] Received the request!',
            }));
        });
    }
    async DBCVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red('[BLWEBHOOKS] DiscordBots.co vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green('[BLWEBHOOKS] DiscordBots.co vote hooks have been enabled.'));
        }
        // @ts-ignore
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
            this.client.emit('DBC-voted', userID);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);
            // Respond to BList API
            res.status(200).send(JSON.stringify({
                error: false,
                message: '[BLWEBHOOKS] Received the request!',
            }));
        });
    }
    async getVotes(userID, option) {
        if (!option)
            return console.log('Please provide option - daily, weekly, monthly');
        if (option == 'total') {
            if (!userID)
                return console.log('Please provide userID');
        }
        else if (option == 'daily') {
            if (!userID)
                return console.log('Please provide userID');
        }
        else if (option == 'weekly') {
            if (!userID)
                return console.log('Please provide userID');
        }
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
            // @ts-ignore
            mongoose_1.default.connect(this.options.string);
        }
        else if (this.options.database == 'sqlite3') {
            var sqlite3 = require('sqlite3').verbose();
            let db = new sqlite3.Database('voteHooks.db', async (err) => {
                if (err) {
                    console.error(chalk_1.default.red(err.message));
                }
                console.log(chalk_1.default.yellow('[BLWEBHOOKS] Enabled SQLITE database.'));
                console.log(chalk_1.default.yellow('[BLWEBHOOKS] Connected to the voteHooks.db database.'));
            });
        }
        else if (this.options.database == 'none') {
            console.log(chalk_1.default.red('Database Disabled'));
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
