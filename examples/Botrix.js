const discord = require("discord.js");
const client = discord.Client();

const { WebhooksManager } = require("blwebhooks");

// Attatch The Client and Port to the module.
// The client is it attaching to the client, 80 is the port it will run on
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

voteClient.BotrixVoteHook("Botrix", "LOADS_OF_RANDOMNESS", true);

// This code will run after a new vote was received from Botrix
client.on("BTR-voted", async function (userID) {
  console.log(`${userID} Voted!`)
  
  // Add role for 24 hours
  const guildD = client.guilds.cache.get("721282458708082713")
   guildD.members.fetch(userID).catch(() => null).then(member => {
     
      if (!member) return;
     
      member.roles.add("748340144897261660");
     
      setTimeout(() => member.roles.remove("748340144897261660").catch(console.error), 1000 * 60 * 60 * 24);
     
}).catch(() => {});
  
});
