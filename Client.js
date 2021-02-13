class Client {
    constructor(client, whKeys, port) {
        if (typeof client != "string") {
            throw new TypeError('[BLWEBHOOKS] Client is not defined');
        } else if (typeof port != "number") {
            throw new TypeError('[BLWEBHOOKS] Port Number is not defined');
        }else if (typeof whKeys != "number") {
            throw new TypeError('[BLWEBHOOKS] Port Number is not defined');
        }
    }

    async fetchLink(link_id) {

    }
}

module.exports.Client = Client;