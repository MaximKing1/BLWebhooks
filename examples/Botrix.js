const discord = require("discord.js");
const client = discord.Client();

// Requires Manager from blwebhooks
const { WebhooksManager } = require("blwebhooks");
// Creates the voteClient manager
const voteClient = new WebhooksManager(client, 80);
// Now we have attached the manager to the client so we can use it everywhere!
client.voteManager = voteClient;

voteClient.extraProtection(true);

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

client.on('ready', () => {
    console.log('I\'m ready !');
});

client.login(settings.token);
