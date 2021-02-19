[![Known Vulnerabilities](https://snyk.io/test/github/Strider-Bot/BLWebhooks/badge.svg)](https://snyk.io/test/github/Strider-Bot/BLWebhooks)
[![npm version](https://badge.fury.io/js/blwebhooks.svg)](https://badge.fury.io/js/blwebhooks)
[![dependencies Status](https://status.david-dm.org/gh/Strider-Bot/BLWebhooks.svg)](https://david-dm.org/Strider-Bot/BLWebhooks)
[![install size](https://packagephobia.com/badge?p=blwebhooks)](https://packagephobia.com/result?p=blwebhooks)
[![](https://data.jsdelivr.com/v1/package/npm/blwebhooks/badge?style=rounded)](https://www.jsdelivr.com/package/npm/blwebhooks)
[![DeepScan grade](https://deepscan.io/api/teams/12955/projects/15994/branches/330623/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=12955&pid=15994&bid=330623)

[![blwebhooks](https://snyk.io/advisor/npm-package/blwebhooks/badge.svg)](https://snyk.io/advisor/npm-package/blwebhooks)

[![NPM](https://nodei.co/npm/blwebhooks.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/blwebhooks/)

# BLWebhooks, The Next Gen Vote Hooks!

# Table of Contents

- [Installation](#installation)
- [Contributing](#contributing)
- [Supported Libraries](#supported-libraries)
- [Support Lists](#supported-lists)
- [Usage](#usage)
- [Vote Hooks](#vote-hooks)
- [Events](#events)
- [Vote Database](#vote-database)
- [Other Projects](#our-projects)

# Installation

Need Any Help Setting It Up? Join Our [Support Server](https://discord.gg/8j4ZkpPvzP).

It's intended to be used with discord.js v12.

BLWebhooks fully supports external and discord.js internal sharding, make sure to enable the Sharded Client Option.

Please do remember this is in beta, before writing a negative review please open a issue first so we can have a chance to resolve the issue.

**NPM (recommended)**
```js
# Stable
npm i --save blwebhooks

# Nughtly Builds
npm i --save blwebhooks@nightly
```

**Yarn**
```js
# Stable
yarn add blwebhooks

# Nightly Builds
yarn add blwebhooks@nightly
```

# Supported Libraries

| Name                           | Features                                                                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| discord.js | `DATABASE`, `EXPRESS`, `HOOKS`, `SECURITY` |

# Supported Lists

> top.gg<br>
> InfinityBotList<br>
> VoidBots<br>
> DiscordLabs<br>
> Botrix<br>
> Blist<br>
> DiscordBots.co<br>

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

**With Eris**
```js
const Eris = require("eris");
 
var bot = new Eris("BOT_TOKEN");
// Replace BOT_TOKEN with your bot account's token
 
bot.on("ready", () => { // When the bot is ready
    console.log("Ready!"); // Log "Ready!"
});
 
const { WebhooksManager } = require("blwebhooks");

const voteClient = new WebhooksManager(bot, 80);
bot.voteManager = voteClient;

bot.connect(); // Get the bot to connect to Discord
```

**Vote's Storage**
```js
// The DB can be set to either mongo, sqlite
// Only set the string if using the mongoose db
voteClient.setStroage(DB, String);

// MongooseDB Example (recommended)
voteClient.setStroage("mongo", "mongodb://localhost/my_database");

// SQLITE Example
voteClient.setStroage("sqlite");
```
For usage on pulling data see the [Database Vote](#database-vote) Section.

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
voteClient.testVote(userID, botID);
```

# Vote Hooks

**TopGG Vote Hooks:**
```js
// This will listen to votes from top.gg, the url is the end not
// including the / and auth is the webhook auth. You can enable and
// disable using true or false at the end
client.voteManager.topggVoteHook(url, auth, true);

// This code will run after a new vote was received from top.gg
client.on('topgg-voted', async function (userID, botID, type) {
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

**BList Vote Hooks:**
```js
// This will listen to votes from BList, the url is the end not
// including the / and auth is the webhook auth. You can enable and
// disable using true or false at the end
client.voteManager.BListVoteHook(url, auth, true);

// This code will run after a new vote was received from BList
client.on('BLT-voted', async function (userID, botID) {
  console.log(`${userID} Voted.`)
})
```

**DiscordBots.co Vote Hooks:**
```js
// This will listen to votes from BList, the url is the end not
// including the / and auth is the webhook auth. You can enable and
// disable using true or false at the end
client.voteManager.DBCVoteHook(url, auth, true);

// This code will run after a new vote was received from BList
client.on('DBC-voted', async function (userID, botID) {
  console.log(`${userID} Voted.`)
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

# Vote Database
The vote Database feature will save the total votes a User had made for your bot / server, it will add all the vote in a database and the methods below show you how to set it up and pull data.

**discord.js example**
```js
// The DB can be set to either mongo, sqlite
// Only set the string if using the mongoose db
voteClient.setStroage(DB, String);

// MongooseDB Example (recommended)
voteClient.setStroage("mongo", "mongodb://localhost/my_database");

// SQLITE Example
voteClient.setStroage("sqlite");
```

**Pulling User Votes**
```js
voteClient.getVotes(userID, option);
```
*Options*
`daily` - Get Daily Votes
`weekly` - Get Weekly Votes
`monthly` - Get Monthly Votes

# Our Projects

- [DPost](h) (This Is A Work In Progress, Beta Out Now!)
