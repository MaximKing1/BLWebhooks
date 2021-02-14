const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const discord = require('discord.js');
const slowDown = require('express-slow-down');
const rateLimit = require('express-rate-limit');
const chalk = require('chalk');
const { EventEmitter } = require('events');

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

    console.log(chalk.red("---------------------"))
    console.log("The Client Varible Has Been Changed To WebhooksManager, Check Our Docs If Your Code Is Not Working + BLWEvent.on Changed To client.on")
    console.log(chalk.red("---------------------"))

    /**
     * The Discord Client
     * @type {Discord.Client}
    */
    this.client = client;

    if (!client) {
        return console.log(chalk.red('[BLWEBHOOKS] The client is not defined'))
    } else if (typeof port != "number") {
        return console.log(chalk.red('[BLWEBHOOKS] The Port Number is not defined'));
    } else if(client) {
        console.log(chalk.green("[BLWEBHOOKS] The Client has connected to BLWebhooks"))
        this.client.on('error', async (error) => {
        this.client.emit('webhookError', error)
    })
}
    if(port) {
        app.listen(port)
        app.use(bodyParser.json())
        app.use(limiter)
        app.use(speedLimiter)
        console.log(chalk.green(`[BLWEBHOOKS] The Vote Webserver Has Started On Port ${port}.`))
    }
}

    async shardedClient(toggle) {
        if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] Sharding Client Has Been Enabled.'));
        } else if (toggle == false) {
            await console.log(chalk.red('[BLWEBHOOKS] Sharding Client Has Been Disabled.'));
        }
    }

    async setLogging(toggle) {
        if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] Advance Logging Enabled'));
        } else if (toggle == false) {
            await console.log(chalk.red('[BLWEBHOOKS] Advance Logging Disabled'));
        }
    }

    async extraProtection(toggle) {
        if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] Extra Protection enabled.'));
            return app.use(helmet({ contentSecurityPolicy: false, permittedCrossDomainPolicies: false }));
        } else if (toggle == false) {
            await console.log(chalk.red('[BLWEBHOOKS] Extra Protection disabled.'));
        }
    }

    async proxyTrust(toggle) {
        if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] Proxy Trust enabled.'));
            return app.enable("trust proxy");
        } else if (toggle == false) {
            await console.log(chalk.red('[BLWEBHOOKS] Proxy Trust disabled.'));
        }
    } // Enable this if your behind a proxy, Heroku etc

    async refreshStorage() {
        return true;
    }

   async testVote(userID, botID) {
     console.log(userID + " Voted For " + botID)
     this.client.emit('vote', userID, botID)
   }

    async topggVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk.red('[BLWEBHOOKS] top.gg Vote Hooks Disabled'));
        } else if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] top.gg Vote Hooks Enabled'))
        }
      
    const TopGG = require('@top-gg/sdk')
    const WH = new TopGG.Webhook(auth)
    app.post(`/${url}`, WH.middleware(), async (req, res, next) => {
    // Respond to invalid requests
    if (req.header('authorization') != auth) await console.log("Failed Access - top.gg Endpoint");

    console.log(req.vote)
    const userID = req.vote.user;
    const botID = req.vote.bot;
    const type = req.vote.type;
    const List = "top.gg";
    this.client.emit('topgg-voted', userID, botID, type)
    this.client.emit('vote', userID, botID, List)
    setTimeout(() => this.client.emit('voteExpired', userID, botID, List), 1000 * 60 * 60 * 24)

    res.status(200).send(JSON.stringify({error: false, message: "[BLWEBHOOKS] Received The Request!"}));
    })
}

async IBLVoteHook(url, auth, toggle) {
    if (toggle == false) {
        return console.log(chalk.red('[BLWEBHOOKS] InfinityBotList Vote Hooks Disabled'));
    } else if (toggle == true) {
        await console.log(chalk.green('[BLWEBHOOKS] InfinityBotList Vote Hooks Enabled'))
    }
      
    app.post(`/${url}`, async (req, res) => {
        // Respond to invalid requests
        if (req.header('Authorization') != auth) await console.log("Failed Access - InfinityBotList Endpoint");
        if (req.header('Authorization') != auth) return res.status(403).send(JSON.stringify({error: true, message: "[BLWEBHOOKS] You Don't Have Access To Use This Endpoint - InfinityBotList"}));
      
        // Use the data on whatever you want
        console.log(req.body)
        const userID = req.body.userID;
        const botID = req.body.botID;
        const type = req.body.type;
        const timeStamp = req.body.timeStamp;
        const List = "InfinityBotList";
        this.client.emit('IBL-voted', userID, botID, type)
        this.client.emit('vote', userID, botID, List)
        setTimeout(() => this.client.emit('voteExpired', UserID, botID, List), 1000 * 60 * 60 * 24)
      
       // Respond to IBL API
        res.status(200).send(JSON.stringify({error: false, message: "[BLWEBHOOKS] Received The Request!"}));
        
      })      
}

async VoidBotsVoteHook(url, auth, toggle) {
    if (toggle == false) {
        return console.log(chalk.red('[BLWEBHOOKS] Void Bots Vote Hooks Disabled'));
    } else if (toggle == true) {
        await console.log(chalk.green('[BLWEBHOOKS] Void Bots Vote Hooks Enabled'))
    }
      
    app.post(`/${url}`, async (req, res) => {
        // Respond to invalid requests
        if (req.header('Authorization') != auth) await console.log("Failed Access - VoidBots Endpoint");
        if (req.header('Authorization') != auth) return res.status(403).send(JSON.stringify({error: true, message: "[BLWEBHOOKS] You Don't Have Access To Use This Endpoint - VoidBots"}));
      
        // Use the data on whatever you want
        console.log(req.body)
        const userID = req.body.user;
        const botID = req.body.bot;
        const List = "VoidBots";
        this.client.emit('VB-voted', userID, botID)
        this.client.emit('vote', userID, botID, List)
        setTimeout(() => this.client.emit('voteExpired', UserID, botID, List), 1000 * 60 * 60 * 24)
      
       // Respond to VoidBots API
        res.status(200).send(JSON.stringify({error: false, message: "[BLWEBHOOKS] Received The Request!"}));
      })      
}

async DiscordLabsVoteHook(url, auth, toggle) {
    if (toggle == false) {
        return console.log(chalk.red('[BLWEBHOOKS] DiscordLabs Vote Hooks Disabled'));
    } else if (toggle == true) {
        await console.log(chalk.green('[BLWEBHOOKS] DiscordLabs Vote Hooks Enabled'))
    }
      
    app.post(`/${url}`, async (req, res) => {
        // Respond to invalid requests
        if (req.header('Authorization') != auth) await console.log("Failed Access - DiscordLabs Endpoint");
        if (req.header('Authorization') != auth) return res.status(403).send(JSON.stringify({error: true, message: "[BLWEBHOOKS] You Don't Have Access To Use This Endpoint - DiscordLabs"}));
      
        // Use the data on whatever you want
        console.log(req.body)
        const userID = req.body.uid;
        const botID = req.body.bid;
        const wasTest = req.body.test;
        const List = "DiscordLabs";
        this.client.emit('DL-voted', userID, botID, wasTest)
        this.client.emit('vote', userID, botID, List)
        setTimeout(() => this.client.emit('voteExpired', UserID, botID, List), 1000 * 60 * 60 * 24)
      
       // Respond to DiscordLabs API
        res.status(200).send(JSON.stringify({error: false, message: "[BLWEBHOOKS] Received The Request!"}));
      })      
}

async BotrixVoteHook(url, auth, toggle) {
    if (toggle == false) {
        return console.log(chalk.red('[BLWEBHOOKS] Botrix Vote Hooks Disabled'));
    } else if (toggle == true) {
        await console.log(chalk.green('[BLWEBHOOKS] Botrix Vote Hooks Enabled'))
    }
      
    app.post(`/${url}`, async (req, res) => {
        // Respond to invalid requests
        if (req.header('Authorization') != auth) await console.log("Failed Access - Botrix Endpoint");
        if (req.header('Authorization') != auth) return res.status(403).send(JSON.stringify({error: true, message: "[BLWEBHOOKS] You Don't Have Access To Use This Endpoint - Botrix"}));
      
        // Use the data on whatever you want
        console.log(req.body)
        const userID = req.body.user;
        const List = "Botrix";
        this.client.emit('BTR-voted', userID)
        this.client.emit('vote', userID, List)
        setTimeout(() => this.client.emit('voteExpired', UserID, botID, List), 1000 * 60 * 60 * 24)
      
       // Respond to Botrix API
        res.status(200).send(JSON.stringify({error: false, message: "[BLWEBHOOKS] Received The Request!"}));
      })      
}

async BListVoteHook(url, auth, toggle) {
    if (toggle == false) {
        return console.log(chalk.red('[BLWEBHOOKS] BList Vote Hooks Disabled'));
    } else if (toggle == true) {
        await console.log(chalk.green('[BLWEBHOOKS] BList Vote Hooks Enabled'))
    }
      
    app.post(`/${url}`, async (req, res) => {
        // Respond to invalid requests
        if (req.header('Authorization') != auth) await console.log("Failed Access - BList Endpoint");
        if (req.header('Authorization') != auth) return res.status(403).send(JSON.stringify({error: true, message: "[BLWEBHOOKS] You Don't Have Access To Use This Endpoint - BList"}));
      
        // Use the data on whatever you want
        console.log(req.body)
        const userID = req.body.user;
        const List = "BList";
        this.client.emit('BTR-voted', userID)
        this.client.emit('vote', userID, List)
        setTimeout(() => this.client.emit('voteExpired', UserID, botID, List), 1000 * 60 * 60 * 24)
      
       // Respond to BList API
        res.status(200).send(JSON.stringify({error: false, message: "[BLWEBHOOKS] Received The Request!"}));
      })      
}
}

module.exports.WebhooksManager = WebhooksManager;
