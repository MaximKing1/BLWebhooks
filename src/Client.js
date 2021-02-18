const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
// const discord = require('discord.js');
const slowDown = require('express-slow-down');
const rateLimit = require('express-rate-limit');
const chalk = require('chalk');
const { EventEmitter } = require('events');
const errorhandler = require('errorhandler');
const mongoose = require('mongoose');
var VotingModel = require('./Models/vote.js');
const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 250,
    delayMs: 400
});
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 250
});

/**
 * Webhook Manager
 */
class WebhooksManager extends EventEmitter {
    /**
     * @param {Discord.Client} client The Discord Client
     * @param {Express.Port} Webserver port
     */
    constructor(client, port) {
        super();
        console.log(chalk.red("---------------------"));
        console.log("The client has been changed to WebhooksManager, check our docs if your code is not working + BLWEvent.on Changed To client.on");
        console.log(chalk.red("---------------------"));

        let monoogseSet;

        /**
         * The Discord Client
         * @type {Discord.Client}
        */
        this.client = client;
        /**
         * The Port
         * @type {Express.Port}
        */
       this.port = port;

        if (!client) {
            return console.log(chalk.red('[BLWEBHOOKS] The client is not defined'));
        }
        else if (!port) {
            return console.log(chalk.red('[BLWEBHOOKS] The port is required!'));
        }
        else if (typeof port != "number") {
            return console.log(chalk.red('[BLWEBHOOKS] The port is a number.'));
        }
        else if (client) {
            console.log(chalk.green("[BLWEBHOOKS] The Client has connected to BLWebhooks"));
        }
        if (port) {
            app.listen(port);
            app.use(bodyParser.json());
            app.use(limiter);
            app.use(speedLimiter);
            app.use(cookieParser());
            console.log(chalk.green(`[BLWEBHOOKS] The Vote Webserver Has Started On Port ${port}.`));
        }
    }

    async shardedClient(toggle) {
        if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] Sharding client has been enabled.'));
        }
        else if (toggle == false) {
            await console.log(chalk.red('[BLWEBHOOKS] Sharding client has been disabled.'));
        }
    }

    async setStroage(DB, string) {
        if (DB == "mongo") {
            let monoogseSet = true;
            await console.log(chalk.yellow('[BLWEBHOOKS] Enabled mongoose database.'));
            await mongoose.connect(string, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useFindAndModify: false, 
                useCreateIndex: true 
            });
        }
        else if(DB == "sqlite") {
            var sqlite3 = require('sqlite3').verbose();
            let db = new sqlite3.Database('voteHooks.db', async (err) => {
                if (err) {
                  console.error(chalk.red(err.message));
                }
                await console.log(chalk.yellow('[BLWEBHOOKS] Enabled SQLITE database.'));
                await console.log(chalk.yellow('[BLWEBHOOKS] Connected to the voteHooks.db database.'));
              });
        } else if (DB == "mysql") {
            await console.log(chalk.yellow('[BLWEBHOOKS] Enabled MYSQL database.'));
        }
    }

    async setLogging(toggle) {
        if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] Advanced logging enabled.'));
            return app.use(errorhandler());
        }
        else if (toggle == false) {
            await console.log(chalk.red('[BLWEBHOOKS] Advance logging disabled'));
        }
    }

    async extraProtection(toggle) {
        if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] Extra protection enabled.'));
            return app.use(helmet({ contentSecurityPolicy: false, permittedCrossDomainPolicies: false }));
        }
        else if (toggle == false) {
            await console.log(chalk.red('[BLWEBHOOKS] Extra protection disabled.'));
        }
    }

    async proxyTrust(toggle) {
        if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] Proxy trust enabled.'));
            return app.enable("trust proxy");
        }
        else if (toggle == false) {
            await console.log(chalk.red('[BLWEBHOOKS] Proxy trust disabled.'));
        }
    } // Enable this if your behind a proxy, Heroku, Docker, Replit, etc

    async testVote(userID, botID) {
        const type = "test";
        const List = "Test";
        console.log(userID + " Voted For " + botID);
        this.client.emit('vote', userID, botID, List);
        this.client.emit('topgg-voted', userID, botID, type);
        this.client.emit('IBL-voted', userID, botID, type);
    }
    
    async topggVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk.red('[BLWEBHOOKS] Top.gg vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] Top.gg vote hooks have been enabled.'));
        }
        const TopGG = require('@top-gg/sdk');
        const WH = new TopGG.Webhook(auth);
        app.post(`/${url}`, WH.middleware(), async (req, res, next) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                await console.log("Failed Access - Top.gg Endpoint");
            console.log(req.vote);
            VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.vote.user;
            const botID = req.vote.bot;
            const type = req.vote.type;
            const List = "top.gg";
            this.client.emit('topgg-voted', userID, botID, type);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);

            res.status(200).send(JSON.stringify({ error: false, message: "[BLWEBHOOKS] Received The Request!" }));
        });
    }
    async IBLVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk.red('[BLWEBHOOKS] InfinityBotList vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] InfinityBotList vote hooks have been enabled.'));
        }
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                await console.log("Failed Access - InfinityBotList Endpoint");
            if (req.header('Authorization') != auth)
                return res.status(403).send(JSON.stringify({ error: true, message: "[BLWEBHOOKS] You don't have access to use this endpoint. - InfinityBotList" }));
                
            // Use the data on whatever you want
            console.log(req.body);
            VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.userID;
            const botID = req.body.botID;
            const type = req.body.type;
            const List = "InfinityBotList";
            this.client.emit('IBL-voted', userID, botID, type);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);

            // Respond to IBL API
            res.status(200).send(JSON.stringify({ error: false, message: "[BLWEBHOOKS] Received the request!" }));
        });
    }
    async VoidBotsVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk.red('[BLWEBHOOKS] Void Bots vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] Void Bots vote hooks have been enabled.'));
        }
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                await console.log("Failed Access - VoidBots Endpoint");
            if (req.header('Authorization') != auth)
                return res.status(403).send(JSON.stringify({ error: true, message: "[BLWEBHOOKS] You don't have access to this endpoint - VoidBots" }));

            // Use the data on whatever you want
            console.log(req.body);
            VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.user;
            const botID = req.body.bot;
            const List = "VoidBots";
            this.client.emit('VB-voted', userID, botID);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);

            // Respond to VoidBots API
            res.status(200).send(JSON.stringify({ error: false, message: "[BLWEBHOOKS] Received the request!" }));
        });
    }
    async DiscordLabsVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk.red('[BLWEBHOOKS] DiscordLabs vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] DiscordLabs Vote Hooks Enabled'));
        }
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                await console.log("Failed Access - DiscordLabs Endpoint");
            if (req.header('Authorization') != auth)
                return res.status(403).send(JSON.stringify({ error: true, message: "[BLWEBHOOKS] You don't have access to use this endpoint - DiscordLabs" }));

            // Use the data on whatever you want
            console.log(req.body);
            VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.uid;
            const botID = req.body.bid;
            const wasTest = req.body.test;
            const List = "DiscordLabs";
            this.client.emit('DL-voted', userID, botID, wasTest);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);

            // Respond to DiscordLabs API
            res.status(200).send(JSON.stringify({ error: false, message: "[BLWEBHOOKS] Received the request!" }));
        });
    }
    async BotrixVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk.red('[BLWEBHOOKS] Botrix vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] Botrix vote hooks have been enabled.'));
        }
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                await console.log("Failed Access - Botrix Endpoint");
            if (req.header('Authorization') != auth)
                return res.status(403).send(JSON.stringify({ error: true, message: "[BLWEBHOOKS] You don't have access to use this endpoint. - Botrix" }));

            // Use the data on whatever you want
            console.log(req.body);
            VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.user;
            const List = "Botrix";
            this.client.emit('BTR-voted', userID);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);

            // Respond to Botrix API
            res.status(200).send(JSON.stringify({ error: false, message: "[BLWEBHOOKS] Received the request!" }));
        });
    }
    async BListVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk.red('[BLWEBHOOKS] BList vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] BList hote hooks have been enabled.'));
        }
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                await console.log("Failed Access - BList Endpoint");
            if (req.header('Authorization') != auth)
                return res.status(403).send(JSON.stringify({ error: true, message: "[BLWEBHOOKS] You don't have access to use this endpoint - BList" }));

            // Use the data on whatever you want
            console.log(req.body);
            VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.user;
            const time = req.body.time;
            const List = "BList";
            this.client.emit('BLT-voted', userID);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);

            // Respond to BList API
            res.status(200).send(JSON.stringify({ error: false, message: "[BLWEBHOOKS] Received the request!" }));
        });
    }
    async MYBVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk.red('[BLWEBHOOKS] BList vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] BList hote hooks have been enabled.'));
        }
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                await console.log("Failed Access - Mythicalbots Endpoint");
            if (req.header('Authorization') != auth)
                return res.status(403).send(JSON.stringify({ error: true, message: "[BLWEBHOOKS] You don't have access to use this endpoint - Mythicalbots" }));

            // Use the data on whatever you want
            console.log(req.body);
            VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.user;
            const List = "MythicalBots";
            this.client.emit('MYB-voted', userID);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);

            // Respond to Mythicalbots API
            res.status(200).send(JSON.stringify({ error: false, message: "[BLWEBHOOKS] Received the request!" }));
        });
    }
    async DBCVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk.red('[BLWEBHOOKS] DiscordBots.co vote hooks have been disabled.'));
        }
        else if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] DiscordBots.co vote hooks have been enabled.'));
        }
        app.post(`/${url}`, async (req, res) => {
            // Respond to invalid requests
            res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
            if (req.header('Authorization') != auth)
                await console.log("Failed Access - DiscordBots.co Endpoint");
            if (req.header('Authorization') != auth)
                return res.status(403).send(JSON.stringify({ error: true, message: "[BLWEBHOOKS] You don't have access to use this endpoint - DiscordBots.co" }));

            // Use the data on whatever you want
            console.log(req.body);
            VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
            const userID = req.body.userId;
            const time = req.body.time;
            const List = "DiscordBots.co";
            this.client.emit('DBC-voted', userID);
            this.client.emit('vote', userID, botID, List);
            setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24);

            // Respond to BList API
            res.status(200).send(JSON.stringify({ error: false, message: "[BLWEBHOOKS] Received the request!" }));
        });
    }
}

module.exports.WebhooksManager = WebhooksManager;
