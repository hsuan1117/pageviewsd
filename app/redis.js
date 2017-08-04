const redis = require("redis");
const config = require('./config')
const debug = require('debug')('http')

const client = redis.createClient({
    host: config.redis.host,
    port: config.redis.port,
    db: config.redis.db,
    prefix: config.redis.prefix
});

client.on('error', function (err) {
    debug(err);
});

module.exports = client;