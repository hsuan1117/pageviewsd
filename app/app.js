const express = require('express')
const app = express()
const config = require('./config')
const worker = require('./worker')
const debug = require('debug')('http')
const hitRoutes = require('./routes/hit')
const statsRoutes = require('./routes/stats')


// app.get('/', function (req, res) {
//     debug(req.method + ' ' + req.url);
//     res.send('Hello World!')
// })

app.use('/hit', hitRoutes);
app.use('/stats', statsRoutes);


app.listen(config.listen.port, function () {
    debug('server listening on port %d', config.listen.port);
})


worker.start();