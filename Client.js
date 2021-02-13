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
    console.log("Working!" + req)
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
        if (req.header('Authorization') != auth) return res.status(403).send(JSON.stringify({error: true, message: "You don't have access to use this endpoint"}));
      
        // Use the data on whatever you want
        console.log(req.body)
        BLWEvent.emit('IBL-voted', req.body.userID)
        const userID = req.body.userID;
        console.log("Working IBL!" + userID)
      
       // Respond to ibl api
        res.status(200).send(JSON.stringify({error: false, message: "[BLWEBHOOKS] Received The Request!"}));
      })      
}
}

module.exports.Client = Client;