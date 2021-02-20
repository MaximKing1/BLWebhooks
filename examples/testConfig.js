const discord = require("discord.js");
const client = discord.Client();

const { WebhooksManager } = require("blwebhooks");

const manager = WebhooksManager(client, {
    database: "mongoose", // mongoose or sqlite
    port: "80"
});
client.voteManager = manager;