const discord = require("discord.js");
const client = discord.Client();

const { WebhooksManager } = require("blwebhooks");

const voteClient = WebhooksManager(client, 80, {
    database: "mongoose", // mongoose or sqlite
    extraLogging: true,
    extra: {
        extraProtection: true,
        proxyTrust: true,
        shardedClient: true
    }
});
client.voteManager = voteClient;