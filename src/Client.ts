import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import bodyParser from "body-parser";
import slowDown from "express-slow-down";
import rateLimit from "express-rate-limit";
import chalk from "chalk";
import merge from "deepmerge";
import { EventEmitter } from "events";
import errorhandler from "errorhandler";
import mongoose from "mongoose";
import VotingModel from "./Models/vote";
import { defaultManager } from "./Constants";

const app = express();

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 250,
  delayMs: 400,
});
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 250,
});

/**
 * Webhook Manager
 */
class WebhooksManager extends EventEmitter {
  client: any;
  port: any;
  options: {
    database: string;
    string(string: any, arg1: { useNewUrlParser: boolean; useUnifiedTopology: boolean; useFindAndModify: boolean; useCreateIndex: boolean; }): unknown;
    storage: null; extraLogging: boolean; extra: {
      extraProtection: boolean; proxyTrust: boolean; shardedClient: boolean;
    };
  };
  db: any;
  ready: boolean;
  /**
   * @param {Discord.Client} client The Discord Client
   * @param {Express.Port} Webserver port
   */
  constructor(client: any, port: any, options: Partial<{ storage: null; extraLogging: boolean; extra: { extraProtection: boolean; proxyTrust: boolean; shardedClient: boolean; }; }>, init = true) {
    super();
    console.log(chalk.red("-----------------------"));
    console.log(
      "All Manager Options Updated Check Our Docs Now! https://github.com/MaximKing1/BLWebhooks#readme"
    );
    console.log(chalk.red("----------------------"));

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
      return console.log(chalk.red("[BLWEBHOOKS] The client is not defined"));
    } else if (!port) {
      // @ts-ignore
      return console.log(chalk.red("[BLWEBHOOKS] The port is required!"));
    } else if (typeof port != "number") {
      // @ts-ignore
      return console.log(chalk.red("[BLWEBHOOKS] The port is a number."));
    } else if (client) {
      console.log(
        chalk.green("[BLWEBHOOKS] The Client has connected to BLWebhooks")
      );
    }
    if (port) {
      app.listen(port);
      app.use(bodyParser.json());
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
        chalk.green("[BLWEBHOOKS] Sharding client has been enabled.")
      );
    } else if (toggle == false) {
      console.log(chalk.red("[BLWEBHOOKS] Sharding client has been disabled."));
    }
  }

  async setStroage(DB: string, string: string) {
    if (DB == "mongo") {
      console.log(chalk.yellow("[BLWEBHOOKS] Enabled mongoose database."));
      mongoose.connect(string, {
        // @ts-ignore
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      });
    } else if (DB == "sqlite") {
      var sqlite3 = require("sqlite3").verbose();
      this.db = new sqlite3.Database("voteHooks.db", async (err: { message: unknown; }) => {
        if (err) {
          console.error(chalk.red(err.message));
        }
        console.log(chalk.yellow("[BLWEBHOOKS] Enabled SQLITE database."));
        console.log(
          chalk.yellow("[BLWEBHOOKS] Connected to the voteHooks.db database.")
        );
      });
    } else if (DB == "mysql") {
      console.log(chalk.yellow("[BLWEBHOOKS] Enabled MYSQL database."));
    }
  }

  async setLogging(toggle: boolean) {
    if (toggle == true) {
      console.log(chalk.green("[BLWEBHOOKS] Advanced logging enabled."));
      return app.use(errorhandler());
    } else if (toggle == false) {
      console.log(chalk.red("[BLWEBHOOKS] Advance logging disabled"));
    }
  }

  async extraProtection(toggle: boolean) {
    if (toggle == true) {
      console.log(chalk.green("[BLWEBHOOKS] Extra protection enabled."));
      return app.use(
        helmet({
          contentSecurityPolicy: false,
          permittedCrossDomainPolicies: false,
        })
      );
    } else if (toggle == false) {
      console.log(chalk.red("[BLWEBHOOKS] Extra protection disabled."));
    }
  }

  async proxyTrust(toggle: boolean) {
    if (toggle == true) {
      console.log(chalk.green("[BLWEBHOOKS] Proxy trust enabled."));
      app.enable("trust proxy");
      return;
    } else if (toggle == false) {
      console.log(chalk.red("[BLWEBHOOKS] Proxy trust disabled."));
    }
  } // Enable this if your behind a proxy, Heroku, Docker, Replit, etc

  async testVote(userID: string, botID: string) {
    const type = "test";
    const List = "Test";
    console.log(userID + " Voted For " + botID);
    this.client.emit("vote", userID, botID, List);
    this.client.emit("topgg-voted", userID, botID, type);
    this.client.emit("IBL-voted", userID, botID, type);
  }

  async getServer(serverID: any) {
    let server = this.client.guilds.cache.get(serverID);
    return server;
  }

  async topggVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red("[BLWEBHOOKS] Top.gg vote hooks have been disabled.")
      );
    } else if (toggle == true) {
      console.log(
        chalk.green("[BLWEBHOOKS] Top.gg vote hooks have been enabled.")
      );
    }
    const TopGG = require("@top-gg/sdk");
    const WH = new TopGG.Webhook(auth);
    // @ts-ignore
    app.post(`/${url}`, WH.middleware(), async (req: { header: (arg0: string) => any; vote: { user: any; bot: any; type: any; }; }, res: { setHeader: (arg0: string, arg1: string) => void; status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
      // Respond to invalid requests
      res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
      if (req.header("Authorization") != auth)
        console.log("Failed Access - Top.gg Endpoint");
      console.log(req.vote);
      const userID = req.vote.user;
      const botID = req.vote.bot;
      const type = req.vote.type;
      const List = "top.gg";
      this.client.emit("topgg-voted", userID, botID, type);
      this.client.emit("vote", userID, botID, List);
      setTimeout(
        () => this.client.emit("voteExpired", userID, botID, List),
        1000 * 60 * 60 * 24
      );

      res.status(200).send(
        JSON.stringify({
          error: false,
          message: "[BLWEBHOOKS] Received The Request!",
        })
      );
    });
  }

  async IBLVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red("[BLWEBHOOKS] InfinityBotList vote hooks have been disabled.")
      );
    } else if (toggle == true) {
      console.log(
        chalk.green(
          "[BLWEBHOOKS] InfinityBotList vote hooks have been enabled."
        )
      );
    }
    // @ts-ignore
    app.post(`/${url}`, async (req: { header: (arg0: string) => any; body: { userID: any; botID: any; type: any; }; }, res: { setHeader: (arg0: string, arg1: string) => void; status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
      // Respond to invalid requests
      res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
      if (req.header("Authorization") != auth)
        console.log("Failed Access - InfinityBotList Endpoint");
      if (req.header("Authorization") != auth)
        return res.status(403).send(
          JSON.stringify({
            error: true,
            message:
              "[BLWEBHOOKS] You don't have access to use this endpoint. - InfinityBotList",
          })
        );

      // Use the data on whatever you want
      console.log(req.body);
      // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
      const userID = req.body.userID;
      const botID = req.body.botID;
      const type = req.body.type;
      const List = "InfinityBotList";
      this.client.emit("IBL-voted", userID, botID, type);
      this.client.emit("vote", userID, botID, List);
      setTimeout(
        () => this.client.emit("voteExpired", userID, botID, List),
        1000 * 60 * 60 * 24
      );

      // Respond to IBL API
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: "[BLWEBHOOKS] Received the request!",
        })
      );
    });
  }

  async PBLVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red("[BLWEBHOOKS] ParaiseBots vote hooks have been disabled.")
      );
    } else if (toggle == true) {
      console.log(
        chalk.green("[BLWEBHOOKS] ParaiseBots vote hooks have been enabled.")
      );
    }
    // @ts-ignore
    app.post(`/${url}`, async (req: { header: (arg0: string) => any; body: { userID: any; bot: any; user: any; }; }, res: { setHeader: (arg0: string, arg1: string) => void; status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
      // Respond to invalid requests
      res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
      if (req.header("Authorization") != auth)
        console.log("Failed Access - ParaiseBots Endpoint");
      if (req.header("Authorization") != auth)
        return res.status(403).send(
          JSON.stringify({
            error: true,
            message:
              "[BLWEBHOOKS] You don't have access to use this endpoint. - ParaiseBots",
          })
        );

      // Use the data on whatever you want
      console.log(req.body);
      // VotingModel.findOneAndUpdate({ userID : req.vote.user }, {$inc : {'totalVotes' : 1}});
      const userID = req.body.userID;
      const botID = req.body.bot;
      const userName = req.body.user;
      const type = null;
      const List = "ParaiseBots";
      this.client.emit("PBL-voted", userID, botID, userName, type);
      this.client.emit("vote", userID, botID, List);
      setTimeout(
        () => this.client.emit("voteExpired", userID, botID, List),
        1000 * 60 * 60 * 24
      );

      // Respond to IBL API
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: "[BLWEBHOOKS] Received the request!",
        })
      );
    });
  }

  async VoidBotsVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red("[BLWEBHOOKS] Void Bots vote hooks have been disabled.")
      );
    } else if (toggle == true) {
      console.log(
        chalk.green("[BLWEBHOOKS] Void Bots vote hooks have been enabled.")
      );
    }
    // @ts-ignore
    app.post(`/${url}`, async (req: { header: (arg0: string) => any; body: { user: any; bot: any; }; }, res: { setHeader: (arg0: string, arg1: string) => void; status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
      // Respond to invalid requests
      res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
      if (req.header("Authorization") != auth)
        console.log("Failed Access - VoidBots Endpoint");
      if (req.header("Authorization") != auth)
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
      const List = "VoidBots";
      this.client.emit("VB-voted", userID, botID);
      this.client.emit("vote", userID, botID, List);
      setTimeout(
        () => this.client.emit("voteExpired", userID, botID, List),
        1000 * 60 * 60 * 24
      );

      // Respond to VoidBots API
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: "[BLWEBHOOKS] Received the request!",
        })
      );
    });
  }

  async DiscordLabsVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red("[BLWEBHOOKS] DiscordLabs vote hooks have been disabled.")
      );
    } else if (toggle == true) {
      console.log(chalk.green("[BLWEBHOOKS] DiscordLabs Vote Hooks Enabled"));
    }
    // @ts-ignore
    app.post(`/${url}`, async (req: { header: (arg0: string) => any; body: { uid: any; bid: any; test: any; }; }, res: { setHeader: (arg0: string, arg1: string) => void; status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
      // Respond to invalid requests
      res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
      if (req.header("Authorization") != auth)
        console.log("Failed Access - DiscordLabs Endpoint");
      if (req.header("Authorization") != auth)
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
      const List = "DiscordLabs";
      this.client.emit("DL-voted", userID, botID, wasTest);
      this.client.emit("vote", userID, botID, List);
      setTimeout(
        () => this.client.emit("voteExpired", userID, botID, List),
        1000 * 60 * 60 * 24
      );

      // Respond to DiscordLabs API
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: "[BLWEBHOOKS] Received the request!",
        })
      );
    });
  }

  async BListVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red("[BLWEBHOOKS] BList vote hooks have been disabled.")
      );
    } else if (toggle == true) {
      console.log(
        chalk.green("[BLWEBHOOKS] BList hote hooks have been enabled.")
      );
    }
    // @ts-ignore
    app.post(`/${url}`, async (req: { header: (arg0: string) => any; body: { user: any; }; }, res: { setHeader: (arg0: string, arg1: string) => void; status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
      // Respond to invalid requests
      res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
      if (req.header("Authorization") != auth)
        console.log("Failed Access - BList Endpoint");
      if (req.header("Authorization") != auth)
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
      const List = "BList";
      this.client.emit("BLT-voted", userID);
      this.client.emit("vote", userID, botID, List);
      setTimeout(
        () => this.client.emit("voteExpired", userID, botID, List),
        1000 * 60 * 60 * 24
      );

      // Respond to BList API
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: "[BLWEBHOOKS] Received the request!",
        })
      );
    });
  }

  async MYBVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red("[BLWEBHOOKS] BList vote hooks have been disabled.")
      );
    } else if (toggle == true) {
      console.log(
        chalk.green("[BLWEBHOOKS] BList hote hooks have been enabled.")
      );
    }
    // @ts-ignore
    app.post(`/${url}`, async (req: { header: (arg0: string) => any; body: { user: any; }; }, res: { setHeader: (arg0: string, arg1: string) => void; status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
      // Respond to invalid requests
      res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
      if (req.header("Authorization") != auth)
        console.log("Failed Access - Mythicalbots Endpoint");
      if (req.header("Authorization") != auth)
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
      const List = "MythicalBots";
      this.client.emit("MYB-voted", userID);
      this.client.emit("vote", userID, botID, List);
      setTimeout(
        () => this.client.emit("voteExpired", userID, botID, List),
        1000 * 60 * 60 * 24
      );

      // Respond to Mythicalbots API
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: "[BLWEBHOOKS] Received the request!",
        })
      );
    });
  }

  async DBCVoteHook(url: any, auth: any, toggle: boolean) {
    if (toggle == false) {
      return console.log(
        chalk.red("[BLWEBHOOKS] DiscordBots.co vote hooks have been disabled.")
      );
    } else if (toggle == true) {
      console.log(
        chalk.green("[BLWEBHOOKS] DiscordBots.co vote hooks have been enabled.")
      );
    }
    // @ts-ignore
    app.post(`/${url}`, async (req: { header: (arg0: string) => any; body: { userId: any; }; }, res: { setHeader: (arg0: string, arg1: string) => void; status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
      // Respond to invalid requests
      res.setHeader("X-Powered-By", "BLWebhooks.js/Express");
      if (req.header("Authorization") != auth)
        console.log("Failed Access - DiscordBots.co Endpoint");
      if (req.header("Authorization") != auth)
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
      const List = "DiscordBots.co";
      this.client.emit("DBC-voted", userID);
      this.client.emit("vote", userID, botID, List);
      setTimeout(
        () => this.client.emit("voteExpired", userID, botID, List),
        1000 * 60 * 60 * 24
      );

      // Respond to BList API
      res.status(200).send(
        JSON.stringify({
          error: false,
          message: "[BLWEBHOOKS] Received the request!",
        })
      );
    });
  }

  async getVotes(userID: any, option: string) {
    if (!option)
      return console.log("Please provide option - daily, weekly, monthly");
    if (option == "total") {
      if (!userID) return console.log("Please provide userID");
    } else if (option == "daily") {
      if (!userID) return console.log("Please provide userID");
    } else if (option == "weekly") {
      if (!userID) return console.log("Please provide userID");
    }
  }

  /**
   * Inits the manager
   * @ignore
   * @private
   */
  async _init() {
    if (this.options.extra.proxyTrust == true) {
      console.log(chalk.green("[BLWEBHOOKS] Proxy trust enabled."));
      return app.enable("trust proxy");
    } else if (this.options.extra.proxyTrust == false) {
      console.log(chalk.red("[BLWEBHOOKS] Proxy trust disabled."));
    } // Enable this if your behind a proxy, Heroku, Docker, Replit, etc

    if (this.options.extra.shardedClient == true) {
      console.log(
        chalk.green("[BLWEBHOOKS] Sharding client has been enabled.")
      );
    } else if (this.options.extra.shardedClient == false) {
      console.log(chalk.red("[BLWEBHOOKS] Sharding client has been disabled."));
    }

    if (this.options.extraLogging == true) {
      console.log(chalk.green("[BLWEBHOOKS] Advanced logging enabled."));
      return app.use(errorhandler());
    } else if (this.options.extraLogging == false) {
      console.log(chalk.red("[BLWEBHOOKS] Advance logging disabled"));
    }

    if (this.options.database == "mongo") {
      console.log(chalk.yellow("[BLWEBHOOKS] Enabled mongoose database."));
      // @ts-ignore
      mongoose.connect(this.options.string, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      });
    } else if (this.options.database == "sqlite") {
      var sqlite3 = require("sqlite3").verbose();
      let db = new sqlite3.Database("voteHooks.db", async (err: { message: unknown; }) => {
        if (err) {
          console.error(chalk.red(err.message));
        }
        console.log(chalk.yellow("[BLWEBHOOKS] Enabled SQLITE database."));
        console.log(
          chalk.yellow("[BLWEBHOOKS] Connected to the voteHooks.db database.")
        );
      });
    } else if (this.options.database == "none") {
      console.log(chalk.red("Database Disabled"));
    }

    if (this.options.extra.extraProtection == true) {
      console.log(chalk.green("[BLWEBHOOKS] Extra protection enabled."));
      return app.use(
        helmet({
          contentSecurityPolicy: false,
          permittedCrossDomainPolicies: false,
        })
      );
    } else if (this.options.extra.extraProtection == false) {
      console.log(chalk.red("[BLWEBHOOKS] Extra protection disabled."));
    }

    this.ready = true;
  }
}

module.exports.WebhooksManager = WebhooksManager;
