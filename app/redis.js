const redis  = require("redis");
const config = require('./config')
const debug  = require('debug')('redis')

const client = redis.createClient({
    url: config.redis.url,
    retry_strategy: function (options) {
        if (options.error) {
            debug(options.error);
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    }
});


module.exports = client;