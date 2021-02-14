// Express Server Requirements
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const helmet = require('helmet');

// Brute Force Protection
const slowDown = require("express-slow-down");
//app.enable("trust proxy");
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 300, // allow 300 requests per 15 minutes, then...
  delayMs: 400 // begin adding 400ms of delay per request above 100:
});

const rateLimit = require("express-rate-limit");
// app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300 // limit each IP to 100 requests per windowMs
});

// Imports
const chalk = require('chalk');
const EventEmitter = require('events');
global.BLWEvent = new EventEmitter();

class Client {
    constructor(client, port) {
        if (!client) {
            return console.log(chalk.red('[BLWEBHOOKS] The client is not defined'))
        } else if (typeof port != "number") {
            return console.log(chalk.red('[BLWEBHOOKS] The Port Number is not defined'));
        }
        if(client) {
         console.log(chalk.green("[BLWEBHOOKS] The Client has connected to BLWebhooks"))
        client.on('error', async (error) => {
         BLWEvent.emit('error', error)
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
            return app.use(helmet({ contentSecurityPolicy: false, permittedCrossDomainPolicies: false, }));
        } else if (toggle == false) {
            await console.log(chalk.red('[BLWEBHOOKS] Extra Protection disabled.'));
        }
    }

    async topggVoteHook(url, auth, toggle) {
        if (toggle == false) {
            return console.log(chalk.red('[BLWEBHOOKS] top.gg Vote Hooks Disabled'));
        } else if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] top.gg Vote Hooks Enabled'))
        }
          
    const Topgg = require('@top-gg/sdk')
    const webhook = new Topgg.Webhook(auth)
    app.post(`/${url}`, webhook.middleware(), (req, res) => {
    const UserID = req.vote.user;
    const botID = req.vote.bot;
    const type = req.vote.type;
    BLWEvent.emit('topgg-voted', UserID, botID, type)
    })
}

async IBLVoteHook(url, auth, toggle) {
    if (toggle == false) {
        return console.log(chalk.red('[BLWEBHOOKS] InfinityBotList Vote Hooks Disabled'));
    } else if (toggle == true) {
        await console.log(chalk.green('[BLWEBHOOKS] InfinityBotList Vote Hooks Enabled'))
    }
      
    app.post(`/${url}`, (req, res) => {
        // Respond to invalid requests
        if (req.header('Authorization') != auth) return res.status(403).send(JSON.stringify({error: true, message: "[BLWEBHOOKS] You Don't Have Access To Use This Endpoint - InfinityBotList"}));
      
        // Use the data on whatever you want
        console.log(req.body)
        const userID = req.body.userID;
        const botID = req.body.botID;
        const type = req.body.type;
        const timeStamp = req.body.timeStamp;
        BLWEvent.emit('IBL-voted', userID, botID, type, timeStamp)
      
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
      
    app.post(`/${url}`, (req, res) => {
        // Respond to invalid requests
        if (req.header('Authorization') != auth) return res.status(403).send(JSON.stringify({error: true, message: "[BLWEBHOOKS] You Don't Have Access To Use This Endpoint - VoidBots"}));
      
        // Use the data on whatever you want
        console.log(req.body)
        const userID = req.body.user;
        const botID = req.body.bot;
        BLWEvent.emit('VB-voted', userID, botID)
      
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
      
    app.post(`/${url}`, (req, res) => {
        // Respond to invalid requests
        if (req.header('Authorization') != auth) return res.status(403).send(JSON.stringify({error: true, message: "[BLWEBHOOKS] You Don't Have Access To Use This Endpoint - DiscordLabs"}));
      
        // Use the data on whatever you want
        console.log(req.body)
        const userID = req.body.uid;
        const botID = req.body.bid;
        const wasTest = req.body.test;
        BLWEvent.emit('DL-voted', userID, botID, wasTest)
      
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
      
    app.post(`/${url}`, (req, res) => {
        // Respond to invalid requests
        if (req.header('Authorization') != auth) return res.status(403).send(JSON.stringify({error: true, message: "[BLWEBHOOKS] You Don't Have Access To Use This Endpoint - Botrix"}));
      
        // Use the data on whatever you want
        console.log(req.body)
        const userID = req.body.uid;
        const botID = req.body.bid;
        BLWEvent.emit('BTR-voted', userID, botID)
      
       // Respond to DiscordLabs API
        res.status(200).send(JSON.stringify({error: false, message: "[BLWEBHOOKS] Received The Request!"}));
      })      
}
}

module.exports.Client = Client;