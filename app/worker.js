const counter = require('./counter');
const config  = require('./config');
const debug   = require('debug')('worker')
const _       = require('lodash');


module.exports = {


    /**
     * Merge counter keys every {config.merge_interval} ms
     *
     * @return {Void}
     */
    startMergeKeysWorker() {
        debug('startMergeKeysWorker');
        setInterval(function(){
            _.forEach(config.labels, function(label) {
                debug('merge keys: %s', label);
                counter.mergeKeys(label);
            });
        }, config.merge_interval)
    },


    /**
     * Increment scores from localScoreStorage
     * every {config.batch_increment_interval} ms
     *
     * @return {Void}
     */
    startBatchIncrementScoreWorker() {
        debug('startBatchIncrementScoreWorker');
        setInterval(function(){
            _.forEach(config.labels, function(label) {
                debug('batch increment scores keys: %s', label);
                counter.batchIncrementFromLocalStorage(label);
            });
        }, config.batch_increment_interval)
    },


    /**
     * Watch for keys ttl every {config.keys_cleaner_interval} ms
     *
     * @return {Void}
     */
    startKeysCleanerWorker() {
        debug('startKeysCleanerWorker');
        setInterval(function(){
            _.forEach(config.labels, function(label) {
                debug('update keys ttl: %s', label);
                counter.setKeysTTL(label);
            });
        }, config.keys_cleaner_interval)
    },


    /**
     * Start all workers
     *
     * @param {Function} callback
     * @return {Void}
     */
    start(callback) {
        counter.initLocalScoreStorage();
        this.startKeysCleanerWorker();
        this.startBatchIncrementScoreWorker();
        this.startMergeKeysWorker();
        callback();
    }
    
};
