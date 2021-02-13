const express = require('express');
const app = express();
const chalk = require('chalk');

class Client {
    constructor(client, whKeys, port) {
        if (!client) {
            return console.log(chalk.red('[BLWEBHOOKS] The client is not defined'))
        } else if (!whKeys) {
            return console.log(chalk.red('[BLWEBHOOKS] The whKeys are not defined'))
        } else if (typeof port != "number") {
            return console.log(chalk.red('[BLWEBHOOKS] The Port Number is not defined'));
        }
        if(port) {
            app.listen(port);
            console.log(chalk.green(`[BLWEBHOOKS] The Vote Webserver Has Started On Port ${port}.`));
        }
        if(whKeys) {
            console.log(chalk.green(`[BLWEBHOOKS] Webhook Keys Have Been Registered!`));
        }
    }

    async setLogging(toggle) {
        if (toggle == true) {
            await console.log(chalk.green('[BLWEBHOOKS] Advance Logging Enabled'));
        } else if (toggle == false) {
            await console.log(chalk.red('[BLWEBHOOKS] Advance Logging Disabled'));
        }
    }
}

module.exports.Client = Client;