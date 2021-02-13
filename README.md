# BLWebhooks, The Next Gen Vote Hooks!

# Installation
**NPM (Recommended)**
```
npm i blwebhooks
```
**Yarn**
```
yarn add blwebhooks
```

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
const discord = require('discord.js');
const client = discord.Client();

const blwebhooks = require("blwebhooks");

// Attatch The Client and Port to the module.
// The client is it attaching to the client,  80 is the port it will run on
const bl = new blwebhooks.Client(client, 80);
```
**Turn On Logging**
```js
// This will enable the extended logging, this is mainly for debugging purposes
// All errors will be logged without using this setting
const logging = bl.setLogging(true);
```

# Vote Hooks

**TopGG Vote Hooks:**
```js
// This will listen to votes from top.gg, the url is the end not
// including the / and auth is the webhook auth. You can enable and
// disable using true or false at the end
const topgg = bl.topggVoteHook(url, auth, true);
```

# Events

**Voted Event**
```js
// This code will run after a new vote was received
bl.event("vote", async (userID, botID) => {
 // Code here
});
```
**Error Event**
```js
// This code will run in the event of a error, normally it will just console.log the error but you can add custom error events here
bl.event("error", async (error) => {
 // Code here
});
```

# whKeys - Future Feature
These are all the webhooks and auths.

**Example:**
```json
{
    "service": "auth",
    "service": "auth",
}
```
**Real World Example:**
```json
{
    "top.gg": "278y4h_webhook_auth",
    "infinitybotlist": "278y4h_webhook_auth"
}
```
**With discord.js:**
```js
const discord = require('discord.js');
const client = discord.Client();

const blwebhooks = require("blwebhooks");

const whKeys = {
    "top.gg": "278y4h_webhook_auth",
    "infinitybotlist": "278y4h_webhook_auth"
};

// This will listen out for the top.gg and
// infinitybotlist webhooks on Port 80
const bl = new blwebhooks.Client(client, whKeys, 80);
```