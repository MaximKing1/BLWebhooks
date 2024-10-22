import chalk from "chalk";
import { EventEmitter } from "events";
import { Client } from "discord.js";

/**
 * SettingsManager for handling webhook settings
 */
class SettingsManager extends EventEmitter {
    client: Client;
    port: number;

    /**
     * @param {Client} client The Discord Client
     * @param {number} port The port number
     */
    constructor(client: Client, port: number) {
        super();
        this.client = client;
        this.port = port;
    }

    async setShardedClient(enabled: boolean): Promise<void> {
        const status = enabled ? "enabled" : "disabled";
        const logColor = enabled ? chalk.green : chalk.red;
        console.log(logColor(`[BLWEBHOOKS] Sharding client has been ${status}.`));
    }
}

export { SettingsManager };