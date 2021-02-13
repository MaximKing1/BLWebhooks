const express = require('express');
const app = express();
const chalk = require('chalk');

class Client {
    constructor(client, whKeys, port) {
        global.port = port;
        if (!client) {
            return console.log(chalk.red('[BLWEBHOOKS] The client is not defined'))
        } else if (!whKeys) {
            return console.log(chalk.red('[BLWEBHOOKS] The whKeys are not defined'))
        } else if (typeof port != "number") {
            return console.log(chalk.red('[BLWEBHOOKS] The Port Number is not defined'));
        }
        if(whKeys) {
            console.log(chalk.green(`[BLWEBHOOKS] Webhook Keys Have Been Registered!`))
        }
        if(port) {
            app.listen(port);
            console.log(chalk.green(`[BLWEBHOOKS] The Vote Webserver Has Started On Port ${port}.`));
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
    const webhook = new Topgg.Webhook(auth) // add your top.gg webhook authorization (not bot token)
    app.post(`/${url}`, webhook.middleware(), (req, res) => {
    // req.vote is your vote object e.g
    console.log(req.vote.user) // 221221226561929217
    }) // attach the middleware
}
}

module.exports.Client = Client;