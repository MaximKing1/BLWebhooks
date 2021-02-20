# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.7.9](https://github.com/MaximKing1/BLWebhooks/compare/v1.7.5...v1.7.9) (2021-02-20)

* **Major Update:** The new manager options will now replace this,
```js
voteClient.extraLogging(true);
```
with this:
```js
const voteClient = WebhooksManager(client, 80, {
    database: "mongoose", // mongoose or sqlite for vote logging
    extraLogging: true, // This will enable extraLogging {Debugging}
    extra: {
        extraProtection: true, // Leave Enabled Unless Using Small Amount Of RAM
        proxyTrust: false, // Enable this if your behind a proxy, Heroku, Docker, Replit, etc
        shardedClient: false // Use this if your using a sharded client {ShardingManager}
    }
});
```

### [1.7.3](https://github.com/MaximKing1/BLWebhooks/compare/v1.7.2...v1.7.3) (2021-02-20)

* **Added:** Added typing for typescript
### [1.6.17](https://github.com/MaximKing1/BLWebhooks/compare/v1.6.16...v1.6.17) (2021-02-19)

### [1.6.16](https://github.com/MaximKing1/BLWebhooks/compare/v1.6.15...v1.6.16) (2021-02-19)

### [1.6.15](https://github.com/Strider-Bot/BLWebhooks/compare/v1.6.14...v1.6.15) (2021-02-19)

* **Added:** Added funding page
### [1.6.14](https://github.com/Strider-Bot/BLWebhooks/compare/v1.6.13...v1.6.14) (2021-02-19)

### [1.6.13](https://github.com/Strider-Bot/BLWebhooks/compare/v1.6.12...v1.6.13) (2021-02-19)

* **Changelog:** Updated the changelog to contain all the latest versions.
* **Bug Fixes:** Fixed bug where the Voting Points would not save.

### [1.6.12](https://github.com/Strider-Bot/BLWebhooks/compare/v1.6.11...v1.6.12) (2021-02-19)

* **Bug Fixes:** Fixed bug where some vote hooks didnt recieve any data.

### [1.6.11](https://github.com/Strider-Bot/BLWebhooks/compare/v1.6.10...v1.6.11) (2021-02-19)

* **Security:** Added extra security scanning present on the description.
