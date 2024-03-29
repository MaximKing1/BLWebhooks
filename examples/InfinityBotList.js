import { Client } from "discord.js";
const client = new Client({
  intents: []
});

import { WebhooksManager } from "blwebhooks";

// Attatch The Client and Port to the module.
// The client is it attaching to the client, 80 is the port it will run on
const voteClient = new WebhooksManager(client, 80);
client.voteManager = voteClient;

voteClient.extraProtection(true);

voteClient.IBLVoteHook("IBLHook", "LOADS_OF_RANDOMNESS", true);

// This code will run after a new vote was received from InfinityBotList
client.on("IBL-voted", async function (userID, botID, type, timeStamp) {
  console.log(userID)
  
  // Add role for 24 hours
  const guildD = client.guilds.cache.get("758641373074423808")
   guildD.members.fetch(userID).catch(() => null).then(member => {
     
       if (!member) return;
     
      member.roles.add("748340144897261660");
     
      setTimeout(() => member.roles.remove("748739144897261660").catch(console.error), 1000 * 60 * 60 * 24);
     
}).catch(() => {});

});
