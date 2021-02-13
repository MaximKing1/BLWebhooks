const express = require('express');
const app = express();
const bodyParser = require("body-parser");

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
        if(port) {
            app.listen(port)
            app.use(bodyParser.json())
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
    BLWEvent.emit('topgg-voted', UserID)
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
        BLWEvent.emit('IBL-voted', userID)
      
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
        console.log(req)
        const userID = req.body.uid;
        const botID = req.body.bid;
        const wasTest = req.body.test;
        BLWEvent.emit('DL-voted', userID, botID, wasTest)
      
       // Respond to DiscordLabs API
        res.status(200).send(JSON.stringify({error: false, message: "[BLWEBHOOKS] Received The Request!"}));
      })      
}
}

module.exports.Client = Client;