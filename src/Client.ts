// Import required modules
import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { json } from 'body-parser';
import slowDown from 'express-slow-down';
import rateLimit from 'express-rate-limit';
import chalk from 'chalk';
import merge from 'deepmerge';
import { EventEmitter } from 'events';
import errorhandler from 'errorhandler';
import mongoose from 'mongoose';
import { defaultManager } from './Constants';
import UserVote from './models/vote';
import TopGG from '@top-gg/sdk';

// Initialize Express application
const app = express();

// Configure speed limiter
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 250, // Start delaying after 250 requests
  delayMs: () => 400, // Delay each request by 400ms
  message: 'Too many requests from this IP, please try again later.',
});

// Configure rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 250, // Limit each IP to 250 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

export interface WebhooksManager extends EventEmitter {
  client: any;
  port: number;
  options: {
    /**
     * The client protocol, either 'discordjs' or 'eris'
     */
    protocol: 'discordjs' | 'eris';
    /**
     * The database type, either 'mongoose' or 'sqlite3'
     */
    database: 'mongoose' | 'sqlite3' | 'none';
    /**
     * The MongoDB connection string
     */
    connectionString: string;
    extra: null | {
      extraProtection: boolean;
      proxyTrust: boolean;
      shardedClient: boolean;
    };
    extraLogging: boolean;
  };
  db: mongoose.Connection | any; // Replace 'any' with appropriate SQLite type if needed
  ready: boolean;
}

/**
 * The Webhook Manager Class for configuration
 * @example
 * ```js
 * import { WebhooksManager } from "blwebhooks";
 *
 * const manager = new WebhooksManager(client, PORT, {
 *   database: "mongoose", // mongoose or sqlite
 *   protocol: 'discordjs',
 *   extra: {
 *     proxyTrust: true, // Use if behind a proxy
 *     shardedClient: true, // Use if behind a sharded client
 *     extraProtection: true // Use for enhanced security features (Will require more RAM)
 *   }
 * });
 *
 * client.voteManager = manager; // Attach the manager to the discord client
 * ```
 *
 * @param client - The Discord.js v14 client instance.
 * @param options - Configuration options for the WebhooksManager.
 * @param options.database - The database type to use ("mongoose" or "sqlite").
 * @param options.protocol - The protocol to use ("discordjs" or "eris").
 * @param options.port - The port for the Express webserver.
 * @param options.extra - Additional storage options.
 * @param options.extra.proxyTrust - Set to true if behind a proxy.
 * @param options.extra.shardedClient - Set to true if using a sharded client.
 * @param options.extra.extraProtection - Enable enhanced security features (requires more RAM).
 *
 * @since 1.0.3
 */
export class WebhooksManager extends EventEmitter {
  client: any;
  port: number;

  options: {
    /**
     * The client protocol, either 'discordjs' or 'eris'
     */
    protocol: 'discordjs' | 'eris';

    /**
     * The database type, either 'mongoose' or 'sqlite3'
     */
    database: 'mongoose' | 'sqlite3' | 'none';

    /**
     * The MongoDB connection string
     */
    connectionString: string;

    /**
     * Storage options for extra configuration
     */
    extra: null | {
      extraProtection: boolean;
      proxyTrust: boolean;
      shardedClient: boolean;
    };

    /**
     * Enable extra logging
     */
    extraLogging: boolean;
  };

  db: mongoose.Connection | any; // Replace 'any' with appropriate SQLite type if needed

  /**
   * Indicates whether the manager is ready
   */
  ready: boolean = false;

  /**
   * @param {Discord.Client} client The Discord Client
   * @param {Express.Port} port The port of the webserver
   */
  constructor(
    client: any,
    port: any,
    options: Partial<{
      storage: null;
      extraLogging: boolean;
      extra: {
        extraProtection: boolean;
        proxyTrust: boolean;
        shardedClient: boolean;
      };
    }>,
    init = true
  ) {
    super();
    console.log(chalk.red('━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.yellow('Important Notice:'));
    console.log(chalk.cyan('Manager options have been updated.'));
    console.log(chalk.cyan('Please review our documentation at:'));
    console.log(chalk.blue('https://github.com/MaximKing1/BLWebhooks#readme'));
    console.log(chalk.red('━━━━━━━━━━━━━━━━━━━━━━━'));

    /**
     * The Discord Client
     * @type {discord.Client}
     */
    this.client = client;
    /**
     * The Port
     * @type {Express.Port}
     */
    this.port = port;
    /**
     * The manager options
     * @type {WebhooksManagerOptions}
     */
    // @ts-ignore
    this.options = merge(defaultManager, options);

    if (!client) {
      // @ts-ignore
      return console.log(chalk.red('[BLWEBHOOKS] The client is not defined'));
    } else if (!port) {
      // @ts-ignore
      return console.log(chalk.red('[BLWEBHOOKS] The port is required!'));
    } else if (typeof port != 'number') {
      // @ts-ignore
      return console.log(chalk.red('[BLWEBHOOKS] The port is a number.'));
    } else if (client) {
      console.log(
        chalk.green('[BLWEBHOOKS] The Client has connected to BLWebhooks')
      );
    }

    if (port) {
      app.listen(port);
      app.use(json());
      app.use(limiter);
      app.use(speedLimiter);
      app.use(cookieParser());
      console.log(
        chalk.green(
          `[BLWEBHOOKS] The Vote Webserver Has Started On Port ${port}.`
        )
      );
    }

    if (init) this._init();
  }

  async shardedClient(toggle: boolean) {
    if (toggle == true) {
      console.log(
        chalk.green('[BLWEBHOOKS] Sharding client has been enabled.')
      );
    } else if (toggle == false) {
      console.log(chalk.red('[BLWEBHOOKS] Sharding client has been disabled.'));
    }
  }

  /**
   * @example
   * ```js
   * await voteManager.setStroage('mongoose', 'MongooseURL');
   * ```
   */
  async setStroage(DB: string, string: string) {
    if (DB === 'mongoose') {
      console.log(chalk.yellow('[BLWEBHOOKS] Enabled mongoose database.'));
      mongoose.connect(string, {
        // @ts-ignore
        useUnifiedTopology: true,
        useFindAndModify: true,
        useCreateIndex: true,
      });
    } else if (DB == 'sqlite3') {
      var sqlite3 = require('sqlite3');
      this.db = new sqlite3.Database(
        'blwebhooks.db',
        async (err: { message: unknown }) => {
          if (err) {
            console.error(chalk.red(err.message));
          }
          console.log(chalk.yellow('[BLWEBHOOKS] Enabled SQLITE database.'));
          console.log(
            chalk.yellow(
              '[BLWEBHOOKS] Connected to the blwebhooks.db database.'
            )
          );
        }
      );
    } else if (DB == 'mysql') {
      console.log(
        chalk.yellow('[BLWEBHOOKS - Beta] Enabled MySQL database Connection.')
      );
    }
  }

  /**
   * @example
   * ```js
   * await voteManager.setLogging(true);
   * ```
   */
  async setLogging(toggle: boolean) {
    if (toggle == true) {
      console.log(chalk.green('[BLWEBHOOKS] Advanced logging enabled.'));
      return app.use(errorhandler());
    } else if (toggle == false) {
      console.log(chalk.red('[BLWEBHOOKS] Advance logging disabled'));
    }
  }

  /**
   * @example
   * ```js
   * await voteManager.extraProtection(true);
   * ```
   */
  async extraProtection(toggle: boolean) {
    if (toggle == true) {
      console.log(chalk.green('[BLWEBHOOKS] Extra protection enabled.'));
      return app.use(
        helmet({
          contentSecurityPolicy: false,
          permittedCrossDomainPolicies: false,
        })
      );
    } else if (toggle == false) {
      console.log(chalk.red('[BLWEBHOOKS] Extra protection disabled.'));
    }
  }

  /**
   * @example
   * ```js
   * await voteManager.proxyTrust(true);
   * ```
   */
  async proxyTrust(toggle: boolean): Promise<void> {
    if (toggle) {
      console.log(chalk.green('[BLWEBHOOKS] Proxy trust enabled.'));
      app.enable('trust proxy');
    } else {
      console.log(chalk.red('[BLWEBHOOKS] Proxy trust disabled.'));
      app.disable('trust proxy');
    }
  }

  /**
   * @example
   * ```js
   * await voteManager.testVote('userID', 'botID');
   * ```
   */
  async testVote(userID: string, botID: string): Promise<void> {
    const type = 'test';
    const list = 'Test';
    console.log(`${userID} voted for ${botID}`);

    // Emit events
    this.client.emit('vote', userID, botID, list);
    this.client.emit('topgg-voted', userID, botID, type);
    this.client.emit('IBL-voted', userID, botID, type);

    // Simulate vote expiration after 24 hours
    setTimeout(() => {
      this.client.emit('voteExpired', userID, botID, list);
    }, 1000 * 60 * 60 * 24);
  }

  /**
   * @example
   * ```js
   * const server = await voteManager.getServer('serverID');
   * ```
   */
  async getServer(serverID: string) {
    let server;
    if (this.options.protocol === 'discordjs') {
      server = await this.client.guilds.cache.get(serverID);
    } else if (this.options.protocol === 'eris') {
      server = this.client.guilds.get(serverID);
    } else {
      throw new Error('Invalid protocol specified');
    }
    return server;
  }

  /**
   * @example
   * ```js
   * await voteManager.topggVoteHook('url', 'auth', true);
   * ```
   */
  async topggVoteHook(url: string, auth: string, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red('[BLWEBHOOKS] Top.gg vote hooks have been disabled.')
      );
    } else if (toggle == true) {
      console.log(
        chalk.green('[BLWEBHOOKS] Top.gg vote hooks have been enabled.')
      );
    }
    
    const WH = new TopGG.Webhook(auth);

    app.post(
      `/${url}`,
      WH.middleware(),
      async (req: Request, res: Response) => {
        // Respond to invalid requests
        res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
        if (req.header('Authorization') != auth) {
          console.log('Failed Access - Top.gg Endpoint');
          return res.status(403).send(
            JSON.stringify({
              error: true,
              message: "[BLWEBHOOKS] You don't have access to use this endpoint. - Top.gg",
            })
          );
        }

        const userID = req.body.user;
        const botID = req.body.bot;
        const type = req.body.type;
        const List = 'top.gg';

        try {
          // Update the user's vote count in the database
          await UserVote.findOneAndUpdate(
            { userID: userID },
            { $inc: { totalVotes: 1 } },
            { upsert: true, new: true }
          );

          // Emit events
          this.client.emit('topgg-voted', userID, botID, type);
          this.client.emit('vote', userID, botID, List);

          // Set timeout for vote expiration
          setTimeout(
            () => this.client.emit('voteExpired', userID, botID, List),
            1000 * 60 * 60 * 24
          );

          // Respond to Top.gg API
          res.status(200).send(
            JSON.stringify({
              error: false,
              message: '[BLWEBHOOKS] Received the request!',
            })
          );
        } catch (error) {
          console.error('Error updating vote count:', error);
          res.status(500).send(
            JSON.stringify({
              error: true,
              message: '[BLWEBHOOKS] Internal server error',
            })
          );
        }
      }
    );
  }

  /**
   * @example
   * ```js
   * const client = discord.Client();
   * const { WebhooksManager } = require("blwebhooks");
   *
   * const voteClient = new WebhooksManager(client, 80);
   * client.voteManager = voteClient;
   *
   * voteClient.IBLVoteHook("IBLHook", "LOADS_OF_RANDOMNESS", true);
   * ```
   */
  async IBLVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red('[BLWEBHOOKS] InfinityBotList vote hooks have been disabled.')
      );
    } else if (toggle == true) {
      console.log(
        chalk.green(
          '[BLWEBHOOKS] InfinityBotList vote hooks have been enabled.'
        )
      );
    }

    app.post(`/${url}`, async (req: Request, res: Response) => {
      // Respond to invalid requests
      res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
      if (req.header('Authorization') != auth) {
        console.log('Failed Access - InfinityBotList Endpoint');
        return res.status(403).send(
          JSON.stringify({
            error: true,
            message:
              "[BLWEBHOOKS] You don't have access to use this endpoint. - InfinityBotList",
          })
        );
      }

      // Use the data on whatever you want
      console.log(req.body);
      const userID = req.body.userID;
      const botID = req.body.botID;
      const type = req.body.type;
      const List = 'InfinityBotList';

      try {
        // Update the user's vote count in the database
        await UserVote.findOneAndUpdate(
          { userID: userID },
          { $inc: { totalVotes: 1 } },
          { upsert: true, new: true }
        );

        // Emit events
        this.client.emit('IBL-voted', userID, botID, type);
        this.client.emit('vote', userID, botID, List);

        // Set timeout for vote expiration
        setTimeout(
          () => this.client.emit('voteExpired', userID, botID, List),
          1000 * 60 * 60 * 24
        );

        // Respond to IBL API
        res.status(200).send(
          JSON.stringify({
            error: false,
            message: '[BLWEBHOOKS] Received the request!',
          })
        );
      } catch (error) {
        console.error('Error updating user vote count:', error);
        res.status(500).send(
          JSON.stringify({
            error: true,
            message: 'Error updating user vote count',
          })
        );
      }
    });
  }

  /**
   * @deprecated Legacy API
   */
  async PBLVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red('[BLWEBHOOKS] ParaiseBots vote hooks have been disabled.')
      );
    } else if (toggle == true) {
      console.log(
        chalk.green('[BLWEBHOOKS] ParaiseBots vote hooks have been enabled.')
      );
    }
    // @ts-ignore
    app.post(`/${url}`, async (req: Request, res: Response) => {
      // Respond to invalid requests
      res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
      if (req.header('Authorization') != auth)
        console.log('Failed Access - ParaiseBots Endpoint');
      if (req.header('Authorization') != auth)
        return res.status(403).send(
          JSON.stringify({
            error: true,
            message:
              "[BLWEBHOOKS] You don't have access to use this endpoint. - ParaiseBots",
          })
        );

      // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
      const userID = req.body.userID;
      const botID = req.body.bot;
      const userName = req.body.user;
      const type = null;
      const List = 'ParaiseBots';
      this.client.emit('PBL-voted', userID, botID, userName, type);
      this.client.emit('vote', userID, botID, List);
      setTimeout(
        () => this.client.emit('voteExpired', userID, botID, List),
        1000 * 60 * 60 * 24
      );

      // Respond to IBL API
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: '[BLWEBHOOKS] Received the request!',
        })
      );
    });
  }

  async VoidBotsVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red('[BLWEBHOOKS] Void Bots vote hooks have been disabled.')
      );
    } else if (toggle == true) {
      console.log(
        chalk.green('[BLWEBHOOKS] Void Bots vote hooks have been enabled.')
      );
    }
    // @ts-ignore
    app.post(`/${url}`, async (req: Request, res: Response) => {
      // Respond to invalid requests
      res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
      if (req.header('Authorization') != auth)
        console.log('Failed Access - VoidBots Endpoint');
      if (req.header('Authorization') != auth)
        return res.status(403).send(
          JSON.stringify({
            error: true,
            message:
              "[BLWEBHOOKS] You don't have access to this endpoint - VoidBots",
          })
        );

      // Use the data on whatever you want
      console.log(req.body);
      // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
      const userID = req.body.user;
      const botID = req.body.bot;
      const List = 'VoidBots';
      this.client.emit('VB-voted', userID, botID);
      this.client.emit('vote', userID, botID, List);
      setTimeout(
        () => this.client.emit('voteExpired', userID, botID, List),
        1000 * 60 * 60 * 24
      );

      // Respond to VoidBots API
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: '[BLWEBHOOKS] Received the request!',
        })
      );
    });
  }

  async DiscordLabsVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red('[BLWEBHOOKS] DiscordLabs vote hooks have been disabled.')
      );
    } else if (toggle == true) {
      console.log(chalk.green('[BLWEBHOOKS] DiscordLabs Vote Hooks Enabled'));
    }
    // @ts-ignore
    app.post(`/${url}`, async (req: Request, res: Response) => {
      // Respond to invalid requests
      res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
      if (req.header('Authorization') != auth)
        console.log('Failed Access - DiscordLabs Endpoint');
      if (req.header('Authorization') != auth)
        return res.status(403).send(
          JSON.stringify({
            error: true,
            message:
              "[BLWEBHOOKS] You don't have access to use this endpoint - DiscordLabs",
          })
        );

      // Use the data on whatever you want
      console.log(req.body);
      // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
      const userID = req.body.uid;
      const botID = req.body.bid;
      const wasTest = req.body.test;
      const List = 'DiscordLabs';
      this.client.emit('DL-voted', userID, botID, wasTest);
      this.client.emit('vote', userID, botID, List);
      setTimeout(
        () => this.client.emit('voteExpired', userID, botID, List),
        1000 * 60 * 60 * 24
      );

      // Respond to DiscordLabs API
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: '[BLWEBHOOKS] Received the request!',
        })
      );
    });
  }

  async BListVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red('[BLWEBHOOKS] BList vote hooks have been disabled.')
      );
    } else if (toggle == true) {
      console.log(
        chalk.green('[BLWEBHOOKS] BList hote hooks have been enabled.')
      );
    }
    // @ts-ignore
    app.post(`/${url}`, async (req: Request, res: Response) => {
      // Respond to invalid requests
      res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
      if (req.header('Authorization') != auth)
        console.log('Failed Access - BList Endpoint');
      if (req.header('Authorization') != auth)
        return res.status(403).send(
          JSON.stringify({
            error: true,
            message:
              "[BLWEBHOOKS] You don't have access to use this endpoint - BList",
          })
        );

      // Use the data on whatever you want
      console.log(req.body);
      // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
      const userID = req.body.user;
      const botID = null;
      const List = 'BList';
      this.client.emit('BLT-voted', userID);
      this.client.emit('vote', userID, botID, List);
      setTimeout(
        () => this.client.emit('voteExpired', userID, botID, List),
        1000 * 60 * 60 * 24
      );

      // Respond to BList API
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: '[BLWEBHOOKS] Received the request!',
        })
      );
    });
  }

  async MYBVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red('[BLWEBHOOKS] BList vote hooks have been disabled.')
      );
    } else if (toggle == true) {
      console.log(
        chalk.green('[BLWEBHOOKS] BList hote hooks have been enabled.')
      );
    }
    // @ts-ignore
    app.post(`/${url}`, async (req: Request, res: Response) => {
      // Respond to invalid requests
      res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
      if (req.header('Authorization') != auth)
        console.log('Failed Access - Mythicalbots Endpoint');
      if (req.header('Authorization') != auth)
        return res.status(403).send(
          JSON.stringify({
            error: true,
            message:
              "[BLWEBHOOKS] You don't have access to use this endpoint - Mythicalbots",
          })
        );

      // Use the data on whatever you want
      console.log(req.body);
      // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
      const userID = req.body.user;
      const botID = null;
      const List = 'MythicalBots';
      this.client.emit('MYB-voted', userID);
      this.client.emit('vote', userID, botID, List);
      setTimeout(
        () => this.client.emit('voteExpired', userID, botID, List),
        1000 * 60 * 60 * 24
      );

      // Respond to Mythicalbots API
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: '[BLWEBHOOKS] Received the request!',
        })
      );
    });
  }

  async DBCVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red('[BLWEBHOOKS] DiscordBots.co vote hooks have been disabled.')
      );
    } else if (toggle == true) {
      console.log(
        chalk.green('[BLWEBHOOKS] DiscordBots.co vote hooks have been enabled.')
      );
    }
    // @ts-ignore
    app.post(`/${url}`, async (req: Request, res: Response) => {
      // Respond to invalid requests
      res.setHeader('X-Powered-By', 'BLWebhooks.js/Express');
      if (req.header('Authorization') != auth)
        console.log('Failed Access - DiscordBots.co Endpoint');
      if (req.header('Authorization') != auth)
        return res.status(403).send(
          JSON.stringify({
            error: true,
            message:
              "[BLWEBHOOKS] You don't have access to use this endpoint - DiscordBots.co",
          })
        );

      // Use the data on whatever you want
      console.log(req.body);
      // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
      const userID = req.body.userId;
      const botID = null;
      const List = 'DiscordBots.co';
      this.client.emit('DBC-voted', userID);
      this.client.emit('vote', userID, botID, List);
      setTimeout(
        () => this.client.emit('voteExpired', userID, botID, List),
        1000 * 60 * 60 * 24
      );

      // Respond to BList API
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: '[BLWEBHOOKS] Received the request!',
        })
      );
    });
  }

  async getVotes(userID: any, option: string) {
    if (!option)
      return console.log('Please provide option - daily, weekly, monthly');
    if (option == 'total') {
      if (!userID) return console.log('Please provide userID');
    } else if (option == 'daily') {
      if (!userID) return console.log('Please provide userID');
    } else if (option == 'weekly') {
      if (!userID) return console.log('Please provide userID');
    }
  }

  /**
   * Inits the manager
   * @private
   */
  async _init() {
    if (this.options.extra?.proxyTrust == true) {
      console.log(chalk.green('[BLWEBHOOKS] Proxy trust enabled.'));
      return app.enable('trust proxy');
    } else if (this.options.extra?.proxyTrust == false) {
      console.log(chalk.red('[BLWEBHOOKS] Proxy trust disabled.'));
    } // Enable this if your behind a proxy, Heroku, Docker, Replit, etc

    if (this.options.extra?.shardedClient == true) {
      console.log(
        chalk.green('[BLWEBHOOKS] Sharding client has been enabled.')
      );
    } else if (this.options.extra?.shardedClient == false) {
      console.log(chalk.red('[BLWEBHOOKS] Sharding client has been disabled.'));
    }

    if (this.options.extraLogging == true) {
      console.log(chalk.green('[BLWEBHOOKS] Advanced logging enabled.'));
      return app.use(errorhandler());
    } else if (this.options.extraLogging == false) {
      console.log(chalk.red('[BLWEBHOOKS] Advance logging disabled'));
    }

    if (this.options.database == 'mongoose') {
      console.log(chalk.yellow('[BLWEBHOOKS] Enabled mongoose database.'));
      // @ts-ignore
      mongoose.connect(this.options.string);
    } else if (this.options.database == 'sqlite3') {
      var sqlite3 = require('sqlite3').verbose();
      let db = new sqlite3.Database(
        'voteHooks.db',
        async (err: { message: unknown }) => {
          if (err) {
            console.error(chalk.red(err.message));
          }
          console.log(chalk.yellow('[BLWEBHOOKS] Enabled SQLITE database.'));
          console.log(
            chalk.yellow('[BLWEBHOOKS] Connected to the voteHooks.db database.')
          );
        }
      );
    } else if (this.options.database == 'none') {
      console.log(chalk.red('Database Disabled'));
    }

    if (this.options.extra?.extraProtection == true) {
      console.log(chalk.green('[BLWEBHOOKS] Extra protection enabled.'));
      return app.use(
        helmet({
          contentSecurityPolicy: false,
          permittedCrossDomainPolicies: false,
        })
      );
    } else if (this.options.extra?.extraProtection == false) {
      console.log(chalk.red('[BLWEBHOOKS] Extra protection disabled.'));
    }

    this.ready = true;
  }
}
