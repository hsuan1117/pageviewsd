const express = require('express')
const app = express()
const config = require('./config.json')
const worker = require('./worker')
const debug = require('debug')('http')
const hitRoutes = require('./routes/hit')
const getRoutes = require('./routes/get')
const statsRoutes = require('./routes/stats')

app.use('/hit', hitRoutes);
app.use('/get', getRoutes);
app.use('/stats', statsRoutes);

worker.start(function(){
    app.listen(config.listen.port, function () {
        debug('server listening on port %d', config.listen.port);
    });
});