const discord = require('discord.js');
const { EventEmitter } = require('events');

/**
 * Represents a Giveaway
 */
class Webhooks extends EventEmitter {
    constructor(manager, options) {
        super();
        /**
         * The Webhook Manager
         * @type {WebhookManager}
         */
        this.manager = manager;
        /**
         * The Discord Client
         * @type {Discord.Client}
         */
        this.client = manager.client;
    }

    get messageURL () {
        return `https://discord.com/channels/${this.guildID}/${this.channelID}/${this.messageID}`;
    }

 
}

module.exports = Webhooks;
