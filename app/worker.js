const counter = require('./counter');
const config  = require('./config');
const debug   = require('debug')('worker')
const _       = require('lodash');


module.exports = {

    startMergeKeysWorker() {
        setInterval(function(){
            _.forEach(config.labels, function(label) {
                debug('merge keys: %s', label);
                counter.mergeKeys(label);
            });
        }, config.merge_interval)
    },

    startBatchIncrementScoreWorker() {
        setInterval(function(){
            _.forEach(config.labels, function(label) {
                debug('batch increment scores keys: %s', label);
                counter.batchIncrementFromLocalStorage(label);
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
