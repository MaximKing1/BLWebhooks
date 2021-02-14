const discord = require("discord.js");
const client = discord.Client();

const blwebhooks = require("blwebhooks");

// Attatch The Client and Port to the module.
// The client is it attaching to the client, 80 is the port it will run on
const bl = new blwebhooks.Client(client, 80);


const Botrix = bl.BotrixVoteHook("Botrix", "LOADS_OF_RANDOMNESS", true);

// This code will run after a new vote was received from Botrix
BLWEvent.on('BTR-voted', function async (userID) {
  console.log(`${userID} Voted!`)
})
