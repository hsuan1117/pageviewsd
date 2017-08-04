const counter = require('./counter');
const config  = require('./config');
const debug = require('debug')('http')
const _ = require('lodash');

module.exports = {

    startMergeKeysWorker() {
        setInterval(function(){
            _.forEach(config.projects, function(project) {
                debug('merge keys %s', project);
                counter.mergeKeys(project);
            });
        }, config.merge_interval)
    },

    start() {
      this.startMergeKeysWorker();
    }
};
