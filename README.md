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

// Attatch The Client and Webhooks Keys To The Module
blwebhooks.listen(client, whKeys);
```
**Turn On Logging**
```js
// This will enable the extended logging, this is mainly for debugging purposes
// All errors will be logged without using this setting
blwebhooks.logging(true);
```
