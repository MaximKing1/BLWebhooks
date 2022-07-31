import chalk from "chalk";
import { EventEmitter } from "events";

/**
 * Guild SettingsManager
 */
class SettingsManager extends EventEmitter {
    client: any;
    port: any;
    /**
     * @param {Discord.Client} client The Discord Client
     * @param {Express.Port} Webserver port
     */
    constructor(client: any, port: any) {
        super();
        this.client = client;
        this.port = port;

    }

    async shardedClient(toggle: boolean) {
        if (toggle == true) {
            console.log(chalk.green("[BLWEBHOOKS] Sharding client has been enabled."));
        }
        else if (toggle == false) {
            console.log(chalk.red("[BLWEBHOOKS] Sharding client has been disabled."));
        }
    }

}

module.exports.SettingsManager = SettingsManager;