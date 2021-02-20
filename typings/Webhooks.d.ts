/**
 * Guild SettingsManager
 */
export class SettingsManager {
    /**
     * @param {Discord.Client} client The Discord Client
     * @param {Express.Port} Webserver port
     */
    constructor(client: any, port: any);
    client: any;
    port: any;
    shardedClient(toggle: any): Promise<void>;
}