# BLWebhooks Client Documentation

## WebhooksManager Class

The `WebhooksManager` class is the core component of the BLWebhooks library. It provides functionality to handle webhook events from various bot listing services and manage vote data.

### Constructor

- `client`: The Discord client instance (Discord.js or Eris)
- `port`: The port number for the Express server
- `options`: Configuration options for the WebhooksManager
- `init`: Whether to initialize the manager immediately (default: true)

#### Options

- `protocol`: 'discordjs' | 'eris'
- `database`: 'mongoose' | 'sqlite3' | 'none'
- `connectionString`: MongoDB connection string (if using mongoose)
- `extra`: Additional options
  - `extraProtection`: Enable enhanced security features
  - `proxyTrust`: Set to true if behind a proxy
  - `shardedClient`: Set to true if using a sharded client
- `extraLogging`: Enable extra logging

### Methods

#### setStorage(DB: string, connectionString: string)

Set up the database storage.

- `DB`: 'mongoose' | 'sqlite3' | 'mysql'
- `connectionString`: Database connection string (for mongoose)

#### setLogging(toggle: boolean)

Enable or disable advanced logging.

#### extraProtection(toggle: boolean)

Enable or disable extra protection features.

#### proxyTrust(toggle: boolean)

Enable or disable proxy trust.

#### testVote(userID: string, botID: string)

Simulate a test vote event.

#### getServer(serverID: string)

Get a server by ID.

#### topggVoteHook(url: string, auth: string, toggle: boolean)

Set up a webhook for Top.gg votes.

#### IBLVoteHook(url: string, auth: string, toggle: boolean)

Set up a webhook for InfinityBotList votes.

#### VoidBotsVoteHook(url: string, auth: string, toggle: boolean)

Set up a webhook for Void Bots votes.

#### DiscordLabsVoteHook(url: string, auth: string, toggle: boolean)

Set up a webhook for DiscordLabs votes.

#### BListVoteHook(url: string, auth: string, toggle: boolean)

Set up a webhook for BList votes.

#### MYBVoteHook(url: string, auth: string, toggle: boolean)

Set up a webhook for MythicalBots votes.

#### DBCVoteHook(url: string, auth: string, toggle: boolean)

Set up a webhook for DiscordBots.co votes.

#### getVotes(userID: string, option: string): Promise<number>

Get the number of votes for a user.

- `userID`: The ID of the user
- `option`: 'total' | 'daily' | 'weekly' | 'monthly'

### Events

The `WebhooksManager` emits the following events:

- `vote`: Emitted when a vote is received from any service
- `voteExpired`: Emitted when a vote expires (24 hours after voting)
- `topgg-voted`: Emitted for Top.gg votes
- `IBL-voted`: Emitted for InfinityBotList votes
- `VB-voted`: Emitted for Void Bots votes
- `DL-voted`: Emitted for DiscordLabs votes
- `BLT-voted`: Emitted for BList votes
- `MYB-voted`: Emitted for MythicalBots votes
- `DBC-voted`: Emitted for DiscordBots.co votes