class Client {
    constructor(client, whKeys, port) {
        if (typeof client != "string") {
            return console.log('[BLWEBHOOKS] Client is not defined');
        } else if (typeof port != "number") {
            return console.log('[BLWEBHOOKS] Port Number is not defined');
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