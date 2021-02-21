exports.defaultManager = {
  database: null, // mongoose or sqlite
  extraLogging: false,
  extra: {
    extraProtection: true,
    proxyTrust: false,
    shardedClient: false,
  },
};
