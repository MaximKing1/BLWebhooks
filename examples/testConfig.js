import { Client } from "discord.js";
const client = new Client({
    intents: []
});
import { WebhooksManager } from "blwebhooks";

const voteClient = new WebhooksManager(client, 80, {
  database: "none", // mongoose or sqlite
  string: "MongooseURL", // Only Use This If The Database Is Set To Mongoose
  extra: {
    extraLogging: false, // This will enable extraLogging {Debugging}
    extraProtection: true, // Leave Enabled Unless Using Small Amount Of RAM
    proxyTrust: false, // Enable this if your behind a proxy, Heroku,
  },
});
client.voteManager = voteClient;