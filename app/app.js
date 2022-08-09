const express = require('express')
const app     = express()
const config  = require('./config.json')
const worker  = require('./worker')
const debug   = require('debug')('http')

// Remove x-powered-by response header
app.disable('x-powered-by');

// Register routes
app.use('/hit',   require('./routes/hit'));
app.use('/hot',   require('./routes/hot'));
app.use('/get',   require('./routes/get'));
app.use('/stats', require('./routes/stats'));

// Start service worker
worker.start(function(){
    // Start http server
    app.listen(config.listen.port, function () {
        debug('server listening on port %d', config.listen.port);
    });
});
