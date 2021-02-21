exports.defaultManager = {
  database: "mongoose", // mongoose or sqlite
  extraLogging: true,
  extra: {
    extraProtection: true,
    proxyTrust: false,
    shardedClient: false,
  },
};
