const counter = require('./counter');
const config  = require('./config');
const debug   = require('debug')('worker')
const _       = require('lodash');


module.exports = {

    startMergeKeysWorker() {
        setInterval(function(){
            _.forEach(config.labels, function(project) {
                debug('merge keys: %s', project);
                counter.mergeKeys(project);
            });
        }, config.merge_interval)
    },

    startBatchIncrementScoreWorker() {
        setInterval(function(){
            _.forEach(config.labels, function(project) {
                debug('batch increment scores keys: %s', project);
                counter.batchIncrementFromLocalStorage(project);
            });
        }, config.batch_increment_interval)
    },

    start(callback) {
        counter.setKeysTTL();
        counter.initLocalScoreStorage();
        this.startBatchIncrementScoreWorker();
        this.startMergeKeysWorker();
        callback();
    }
    
};
