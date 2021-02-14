

const Botrix = bl.BotrixVoteHook("Botrix", "LOADS_OF_RANDOMNESS", true);

// This code will run after a new vote was received from Botrix
BLWEvent.on('BTR-voted', function async (userID) {
  console.log(`${userID} Voted!`)
})
