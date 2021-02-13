var express = require('express');
var app = new express();

export function listen(client, whKeys, port) {
    if(!client) return console.log(`[BLWEBHOOKS] Client not attached to the module, please make sure before retrying!`);
    if(!whKeys) return console.log(`[BLWEBHOOKS] No webhook keys have been specifyied, please make sure before retrying!`);
    app.listen(port);
    console.log(`[BLWEBHOOKS] The Vote Listener Has Started On Port ${port}`);
}