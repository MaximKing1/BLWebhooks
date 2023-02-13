"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksManager = void 0;
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
const app = (0, express_1.default)();
const speedLimiter = (0, express_slow_down_1.default)({
    windowMs: 15 * 60 * 1000,
    delayAfter: 250,
    delayMs: 400,
});
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 250,
});
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
class WebhooksManager extends events_1.EventEmitter {
    /**
     * @param {Discord.Client} client The Discord Client
     * @param {Express.Port} port The port of the webserver
     */
    constructor(client, port, options, init = true) {
        super();
        /**
         * @returns
         */
        this.ready = false;
        console.log(chalk_1.default.red("-----------------------"));
        console.log("All Manager Options Updated Check Our Docs Now! https://github.com/MaximKing1/BLWebhooks#readme");
        console.log(chalk_1.default.red("----------------------"));
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
            return console.log(chalk_1.default.red("[BLWEBHOOKS] The client is not defined"));
        }
        else if (!port) {
            // @ts-ignore
            return console.log(chalk_1.default.red("[BLWEBHOOKS] The port is required!"));
        }
        else if (typeof port != "number") {
            // @ts-ignore
            return console.log(chalk_1.default.red("[BLWEBHOOKS] The port is a number."));
        }
        else if (client) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] The Client has connected to BLWebhooks"));
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
            console.log(chalk_1.default.green("[BLWEBHOOKS] Sharding client has been enabled."));
        }
        else if (toggle == false) {
            console.log(chalk_1.default.red("[BLWEBHOOKS] Sharding client has been disabled."));
        }
    }
    async setStroage(DB, string) {
        if (DB == "mongo") {
            console.log(chalk_1.default.yellow("[BLWEBHOOKS] Enabled mongoose database."));
            mongoose_1.default.connect(string, {
                // @ts-ignore
                useUnifiedTopology: true,
                useFindAndModify: true,
                useCreateIndex: true,
            });
        }
        else if (DB == "sqlite") {
            var sqlite3 = require("sqlite3");
            this.db = new sqlite3.Database("blwebhooks.db", async (err) => {
                if (err) {
                    console.error(chalk_1.default.red(err.message));
                }
                console.log(chalk_1.default.yellow("[BLWEBHOOKS] Enabled SQLITE database."));
                console.log(chalk_1.default.yellow("[BLWEBHOOKS] Connected to the blwebhooks.db database."));
            });
        }
        else if (DB == "mysql") {
            console.log(chalk_1.default.yellow("[BLWEBHOOKS - Beta] Enabled MySQL database Connection."));
        }
    }
    async setLogging(toggle) {
        if (toggle == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] Advanced logging enabled."));
            return app.use((0, errorhandler_1.default)());
        }
        else if (toggle == false) {
            console.log(chalk_1.default.red("[BLWEBHOOKS] Advance logging disabled"));
        }
    }
    async extraProtection(toggle) {
        if (toggle == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] Extra protection enabled."));
            return app.use((0, helmet_1.default)({
                contentSecurityPolicy: false,
                permittedCrossDomainPolicies: false,
            }));
        }
        else if (toggle == false) {
            console.log(chalk_1.default.red("[BLWEBHOOKS] Extra protection disabled."));
        }
    }
    async proxyTrust(toggle) {
        if (toggle == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] Proxy trust enabled."));
            app.enable("trust proxy");
            return;
        }
        else if (toggle == false) {
            console.log(chalk_1.default.red("[BLWEBHOOKS] Proxy trust disabled."));
        }
    } // Enable this if your behind a proxy, Heroku, Docker, Replit, etc
    async testVote(userID, botID) {
        const type = "test";
        const List = "Test";
        console.log(userID + " Voted For " + botID);
        this.client.emit("vote", userID, botID, List);
        this.client.emit("topgg-voted", userID, botID, type);
        this.client.emit("IBL-voted", userID, botID, type);
    }
    async getServer(serverID) {
        let server = await this.client.guilds.cache.get(serverID);
        return server;
    }
    async topggVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red("[BLWEBHOOKS] Top.gg vote hooks have been disabled."));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] Top.gg vote hooks have been enabled."));
        }
        const TopGG = require("@top-gg/sdk");
        const WH = new TopGG.Webhook(auth);
        // @ts-ignore
        app.post(`/${url}`, WH.middleware(), async (req, res) => {
            // Respond to invalid requests
            res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
            if (req.header("Authorization") != auth)
                return console.log("Failed Access - Top.gg Endpoint");
            const userID = req.vote.user;
            const botID = req.vote.bot;
            const type = req.vote.type;
            const List = "top.gg";
            this.client.emit("topgg-voted", userID, botID, type);
            this.client.emit("vote", userID, botID, List);
            setTimeout(() => this.client.emit("voteExpired", userID, botID, List), 1000 * 60 * 60 * 24);
            res.status(200).send(JSON.stringify({
                error: false,
                message: "[BLWEBHOOKS] Received The Request!",
            }));
        });
    }
    /**
   * @example
const client = discord.Client();
const { WebhooksManager } = require("blwebhooks");

const voteClient = new WebhooksManager(client, 80);
client.voteManager = voteClient;

voteClient.IBLVoteHook("IBLHook", "LOADS_OF_RANDOMNESS", true);
   */
    async IBLVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red("[BLWEBHOOKS] InfinityBotList vote hooks have been disabled."));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] InfinityBotList vote hooks have been enabled."));
        }
        // @ts-ignore
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
            if (req.header("Authorization") != auth)
                return console.log("Failed Access - InfinityBotList Endpoint");
            if (req.header("Authorization") != auth)
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to use this endpoint. - InfinityBotList",
                }));
            // Use the data on whatever you want
            console.log(req.body);
            // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.userID;
            const botID = req.body.botID;
            const type = req.body.type;
            const List = "InfinityBotList";
            this.client.emit("IBL-voted", userID, botID, type);
            this.client.emit("vote", userID, botID, List);
            setTimeout(() => this.client.emit("voteExpired", userID, botID, List), 1000 * 60 * 60 * 24);
            // Respond to IBL API
            res.status(200).send(JSON.stringify({
                error: false,
                message: "[BLWEBHOOKS] Received the request!",
            }));
        });
    }
    /**
     * @deprecated Legacy API
     */
    async PBLVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red("[BLWEBHOOKS] ParaiseBots vote hooks have been disabled."));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] ParaiseBots vote hooks have been enabled."));
        }
        // @ts-ignore
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
            if (req.header("Authorization") != auth)
                console.log("Failed Access - ParaiseBots Endpoint");
            if (req.header("Authorization") != auth)
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to use this endpoint. - ParaiseBots",
                }));
            // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.userID;
            const botID = req.body.bot;
            const userName = req.body.user;
            const type = null;
            const List = "ParaiseBots";
            this.client.emit("PBL-voted", userID, botID, userName, type);
            this.client.emit("vote", userID, botID, List);
            setTimeout(() => this.client.emit("voteExpired", userID, botID, List), 1000 * 60 * 60 * 24);
            // Respond to IBL API
            res.status(200).send(JSON.stringify({
                error: false,
                message: "[BLWEBHOOKS] Received the request!",
            }));
        });
    }
    async VoidBotsVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red("[BLWEBHOOKS] Void Bots vote hooks have been disabled."));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] Void Bots vote hooks have been enabled."));
        }
        // @ts-ignore
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
            if (req.header("Authorization") != auth)
                console.log("Failed Access - VoidBots Endpoint");
            if (req.header("Authorization") != auth)
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to this endpoint - VoidBots",
                }));
            // Use the data on whatever you want
            console.log(req.body);
            // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.user;
            const botID = req.body.bot;
            const List = "VoidBots";
            this.client.emit("VB-voted", userID, botID);
            this.client.emit("vote", userID, botID, List);
            setTimeout(() => this.client.emit("voteExpired", userID, botID, List), 1000 * 60 * 60 * 24);
            // Respond to VoidBots API
            res.status(200).send(JSON.stringify({
                error: false,
                message: "[BLWEBHOOKS] Received the request!",
            }));
        });
    }
    async DiscordLabsVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red("[BLWEBHOOKS] DiscordLabs vote hooks have been disabled."));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] DiscordLabs Vote Hooks Enabled"));
        }
        // @ts-ignore
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
            if (req.header("Authorization") != auth)
                console.log("Failed Access - DiscordLabs Endpoint");
            if (req.header("Authorization") != auth)
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
            const List = "DiscordLabs";
            this.client.emit("DL-voted", userID, botID, wasTest);
            this.client.emit("vote", userID, botID, List);
            setTimeout(() => this.client.emit("voteExpired", userID, botID, List), 1000 * 60 * 60 * 24);
            // Respond to DiscordLabs API
            res.status(200).send(JSON.stringify({
                error: false,
                message: "[BLWEBHOOKS] Received the request!",
            }));
        });
    }
    async BListVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red("[BLWEBHOOKS] BList vote hooks have been disabled."));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] BList hote hooks have been enabled."));
        }
        // @ts-ignore
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
            if (req.header("Authorization") != auth)
                console.log("Failed Access - BList Endpoint");
            if (req.header("Authorization") != auth)
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to use this endpoint - BList",
                }));
            // Use the data on whatever you want
            console.log(req.body);
            // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.user;
            const botID = null;
            const List = "BList";
            this.client.emit("BLT-voted", userID);
            this.client.emit("vote", userID, botID, List);
            setTimeout(() => this.client.emit("voteExpired", userID, botID, List), 1000 * 60 * 60 * 24);
            // Respond to BList API
            res.status(200).send(JSON.stringify({
                error: false,
                message: "[BLWEBHOOKS] Received the request!",
            }));
        });
    }
    async MYBVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red("[BLWEBHOOKS] BList vote hooks have been disabled."));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] BList hote hooks have been enabled."));
        }
        // @ts-ignore
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
            if (req.header("Authorization") != auth)
                console.log("Failed Access - Mythicalbots Endpoint");
            if (req.header("Authorization") != auth)
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to use this endpoint - Mythicalbots",
                }));
            // Use the data on whatever you want
            console.log(req.body);
            // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.user;
            const botID = null;
            const List = "MythicalBots";
            this.client.emit("MYB-voted", userID);
            this.client.emit("vote", userID, botID, List);
            setTimeout(() => this.client.emit("voteExpired", userID, botID, List), 1000 * 60 * 60 * 24);
            // Respond to Mythicalbots API
            res.status(200).send(JSON.stringify({
                error: false,
                message: "[BLWEBHOOKS] Received the request!",
            }));
        });
    }
    async DBCVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk_1.default.red("[BLWEBHOOKS] DiscordBots.co vote hooks have been disabled."));
        }
        else if (toggle == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] DiscordBots.co vote hooks have been enabled."));
        }
        // @ts-ignore
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
            if (req.header("Authorization") != auth)
                console.log("Failed Access - DiscordBots.co Endpoint");
            if (req.header("Authorization") != auth)
                return res.status(403).send(JSON.stringify({
                    error: true,
                    message: "[BLWEBHOOKS] You don't have access to use this endpoint - DiscordBots.co",
                }));
            // Use the data on whatever you want
            console.log(req.body);
            // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.userId;
            const botID = null;
            const List = "DiscordBots.co";
            this.client.emit("DBC-voted", userID);
            this.client.emit("vote", userID, botID, List);
            setTimeout(() => this.client.emit("voteExpired", userID, botID, List), 1000 * 60 * 60 * 24);
            // Respond to BList API
            res.status(200).send(JSON.stringify({
                error: false,
                message: "[BLWEBHOOKS] Received the request!",
            }));
        });
    }
    async getVotes(userID, option) {
        if (!option)
            return console.log("Please provide option - daily, weekly, monthly");
        if (option == "total") {
            if (!userID)
                return console.log("Please provide userID");
        }
        else if (option == "daily") {
            if (!userID)
                return console.log("Please provide userID");
        }
        else if (option == "weekly") {
            if (!userID)
                return console.log("Please provide userID");
        }
    }
    /**
     * Inits the manager
     * @private
     */
    async _init() {
        if (this.options.extra.proxyTrust == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] Proxy trust enabled."));
            return app.enable("trust proxy");
        }
        else if (this.options.extra.proxyTrust == false) {
            console.log(chalk_1.default.red("[BLWEBHOOKS] Proxy trust disabled."));
        } // Enable this if your behind a proxy, Heroku, Docker, Replit, etc
        if (this.options.extra.shardedClient == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] Sharding client has been enabled."));
        }
        else if (this.options.extra.shardedClient == false) {
            console.log(chalk_1.default.red("[BLWEBHOOKS] Sharding client has been disabled."));
        }
        if (this.options.extraLogging == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] Advanced logging enabled."));
            return app.use((0, errorhandler_1.default)());
        }
        else if (this.options.extraLogging == false) {
            console.log(chalk_1.default.red("[BLWEBHOOKS] Advance logging disabled"));
        }
        if (this.options.database == "mongo") {
            console.log(chalk_1.default.yellow("[BLWEBHOOKS] Enabled mongoose database."));
            // @ts-ignore
            mongoose_1.default.connect(this.options.string, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: true,
            });
        }
        else if (this.options.database == "sqlite") {
            var sqlite3 = require("sqlite3").verbose();
            let db = new sqlite3.Database("voteHooks.db", async (err) => {
                if (err) {
                    console.error(chalk_1.default.red(err.message));
                }
                console.log(chalk_1.default.yellow("[BLWEBHOOKS] Enabled SQLITE database."));
                console.log(chalk_1.default.yellow("[BLWEBHOOKS] Connected to the voteHooks.db database."));
            });
        }
        else if (this.options.database == "none") {
            console.log(chalk_1.default.red("Database Disabled"));
        }
        if (this.options.extra.extraProtection == true) {
            console.log(chalk_1.default.green("[BLWEBHOOKS] Extra protection enabled."));
            return app.use((0, helmet_1.default)({
                contentSecurityPolicy: false,
                permittedCrossDomainPolicies: false,
            }));
        }
        else if (this.options.extra.extraProtection == false) {
            console.log(chalk_1.default.red("[BLWEBHOOKS] Extra protection disabled."));
        }
        this.ready = true;
    }
}
exports.WebhooksManager = WebhooksManager;
;
