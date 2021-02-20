const chalk = require("chalk");
const { EventEmitter } = require("events");

/**
 * Guild SettingsManager
 */
class SettingsManager extends EventEmitter {
    /**
     * @param {Discord.Client} client The Discord Client
     * @param {Express.Port} Webserver port
     */
    constructor(client, port) {
        super();
        this.client = client;
        this.port = port;

    }

    async shardedClient(toggle) {
        if (toggle == true) {
            await console.log(chalk.green("[BLWEBHOOKS] Sharding client has been enabled."));
        }
        else if (toggle == false) {
            await console.log(chalk.red("[BLWEBHOOKS] Sharding client has been disabled."));
        }
    }

}

module.exports.SettingsManager = SettingsManager;