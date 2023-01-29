import EventEmitter from 'events';

declare module 'blwebhooks' {
  interface WebhooksManager extends EventEmitter {}

  /**
 * The Webhook Manager Class for configuration
 ```js
import { WebhooksManager } from "blwebhooks";

const manager = WebhooksManager(client, {
    database: "mongoose", // mongoose or sqlite
    port: "80"
});
client.voteManager = manager;
```
 * @since 1.0.3
 */
  class WebhooksManager extends EventEmitter {
    constructor(options?: EventListenerOptions);
  }
}
