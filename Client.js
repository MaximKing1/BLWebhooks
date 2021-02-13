const express = require('express');
const app = express();

class Client {
    constructor(client, whKeys, port) {
        if (!client) {
            return console.log('[BLWEBHOOKS] The client is not defined')
        } else if (!whKeys) {
            return console.log('[BLWEBHOOKS] The whKeys are not defined')
        } else if (typeof port != "number") {
            return console.log('[BLWEBHOOKS] The Port Number is not defined');
        }
        if(port) {
            app.listen(port);
            console.log(`[BLWEBHOOKS] The Vote Webserver Has Started On Port ${port}.`);
        }
        if(whKeys) {
            console.log(`[BLWEBHOOKS] Webhook Keys Have Been Registered!`);
        }
    }

    async setLogging(toggle) {
        if (toggle == true) {
            await console.log('[BLWEBHOOKS] Advance Logging Enabled');
        } else if (toggle == false) {
            await console.log('[BLWEBHOOKS] Advance Logging Disabled');
        }
    }
}

module.exports.Client = Client;