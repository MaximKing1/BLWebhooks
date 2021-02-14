[![Known Vulnerabilities](https://snyk.io/test/github/Strider-Bot/BLWebhooks/badge.svg)](https://snyk.io/test/github/Strider-Bot/BLWebhooks)
[![npm version](https://badge.fury.io/js/blwebhooks.svg)](https://badge.fury.io/js/blwebhooks)
[![dependencies Status](https://status.david-dm.org/gh/Strider-Bot/BLWebhooks.svg)](https://david-dm.org/Strider-Bot/BLWebhooks)
[![install size](https://packagephobia.com/badge?p=blwebhooks)](https://packagephobia.com/result?p=blwebhooks)
[![](https://data.jsdelivr.com/v1/package/npm/blwebhooks/badge?style=rounded)](https://www.jsdelivr.com/package/npm/blwebhooks)

[![NPM](https://nodei.co/npm/blwebhooks.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/blwebhooks/)

# BLWebhooks, The Next Gen Vote Hooks!

# Installation

Need Any Help Setting It Up? Join Our [Support Server](https://discord.gg/8j4ZkpPvzP).

It's intended to be used with discord.js v12.

BLWebhooks fully supports external and discord.js internal sharding, make sure to enable the Upcoming Sharded Client Module.

**NPM (recommended)**
```
npm i blwebhooks --save
```

**Yarn**
```
yarn add blwebhooks
```

# Supported Lists
> top.gg<br>
> InfinityBotList<br>
> VoidBots<br>
> DiscordLabs<br>
> Botrix<br>
> Blist - Support Next Update<br>

# Usage

**Import the lib via ES6 or commonJS modules**
```js
// ES6
import * as blwebhooks from "blwebhooks";
// or commonJS
const blwebhooks = require("blwebhooks");
```

**With discord.js**
```js
const discord = require("discord.js");
const client = discord.Client();
const { WebhooksManager } = require("blwebhooks");

const voteClient = new WebhooksManager(client, 80);
client.voteManager = voteClient;
```

**Turn On Sharding Support**
```js
voteClient.shardedClient(true);
```

**Turn On Extended Security**
```js
// This will enable bruteforce protection for module, once enabled
// it will start the protection also using more CPU.
voteClient.extraProtection(true);
```

**Turn On Proxy Trust**
```js
// Enable this option is you use this behind a proxy like
// Heroku services etc
voteClient.proxyTrust(true);
```

**Emit Test Vote Events**
```js
// Emit a test event to test your Voted Event
voteManager.testVote(userID, botID);
```

# Vote Hooks

**TopGG Vote Hooks:**
```js
// This will listen to votes from top.gg, the url is the end not
// including the / and auth is the webhook auth. You can enable and
// disable using true or false at the end
client.voteManager.topggVoteHook(url, auth, true);

// This code will run after a new vote was received from top.gg
client.on('topgg-voted', async function (UserID, botID, type) {
  console.log(userID)
})
```

**InfinityBotList Vote Hooks:**
```js
// This will listen to votes from InfinityBotList, the url is the end not
// including the / and auth is the webhook auth. You can enable and
// disable using true or false at the end
client.voteManager.IBLVoteHook(url, auth, true);

// This code will run after a new vote was received from InfinityBotList
client.on('IBL-voted', async function (userID, botID, type) {
  console.log(userID)
})
```

**VoidBots Vote Hooks:**
```js
// This will listen to votes from VoidBots, the url is the end not
// including the / and auth is the webhook auth. You can enable and
// disable using true or false at the end
client.voteManager.VoidBotsVoteHook(url, auth, true);

// This code will run after a new vote was received from VoidBots
client.on('VB-voted', async function (userID, botID) {
  console.log(userID + " Voted For " + botID)
})
```

**DiscordLabs Vote Hooks:**
```js
// This will listen to votes from DiscordLabs, the url is the end not
// including the / and auth is the webhook auth. You can enable and
// disable using true or false at the end
client.voteManager.DiscordLabsVoteHook(url, auth, true);

// This code will run after a new vote was received from DiscordLabs
client.on('DL-voted', async function (userID, botID, wasTest) {
  console.log(`${userID} Voted For ${botID}. Was Test: ${wasTest}`)
})
```

**Botrix Vote Hooks:**
```js
// This will listen to votes from Botrix, the url is the end not
// including the / and auth is the webhook auth. You can enable and
// disable using true or false at the end
client.voteManager.BotrixVoteHook(url, auth, true);

// This code will run after a new vote was received from Botrix
client.on('BTR-voted', async function (userID, botID) {
  console.log(`${userID} Voted For ${botID}.`)
})
```

# Events

**Global Voted Event**
```js
// This will run after any vote has been received, use this if you don't want seprate events for each list
client.on('vote', async function (userID, botID, List) {
  console.log(`${userID} Voted For ${botID} on ${List}`)
})
```

**Vote Expired Event**
```js
// This will run after the vote expires, this will be different for each list
client.on('vote-expired', async function (userID, botID, List) {
  console.log(userID)
})
```

**Error Event**
```js
// This code will run in the event of a error, normally it will just console.log the error but you can add custom error events here
client.on('webhookError', async function (error) {
  console.log(userID)
})
```
