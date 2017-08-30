const redis       = require('./redis');
const config      = require('./config');
const keysManager = require('./utils/keys');
const debug       = require('debug')('counter')
const _           = require('lodash');


const localScore = {};


const counter = {


    /**
     * Get all keys for label
     *
     * @param {String} label
     * @param {Function} callback
     * @returns {Iterator.<number>|Iterator.<K>|Iterator.<T>}
     */
    getKeys(label, callback) {
        return redis.keys(label + '*', function(err, keys){
            if (!err) {
                callback(keys);
            }
        });
    },


    /**
     * Get scores for key
     *
     * @param {String} key
     * @param {Function} callback
     * @param {Number} limit
     * @returns {*}
     */
    getKeyScores(key, callback, limit) {
        return redis.zrevrange(key, 0, (limit || -1), 'WITHSCORES', function(err, response) {
            callback(_.mapValues(_.chunk(response, 2), function(i) {
                return {
                    id: i[0],
                    score: i[1]
                }
            }));
        });
    },


    /**
     * Merge date keys scores to merged key
     *
     * @param {String} label
     */
    mergeKeys(label) {
        this.getKeys(label, function(keys) {

            const numberKeys = keys.length;

            if (!numberKeys) {
                debug('mergeKeys: no keys for %s', label);
                return;
            }

            const mergedKey = keysManager.mergedKey(label);
            keys.unshift(mergedKey, numberKeys);
            redis.del(mergedKey);
            redis.zunionstore.apply(redis, keys);
        });
    },


    /**
     * Set ttl`s for date keys
     *
     * @param {String} label
     */
    setKeysTTL(label) {
        this.getKeys(label, function(keys) {

            const numberKeys = keys.length;

            if (!numberKeys) {
                debug('setKeysTTL: no keys for %s', label);
                return;
            }

            const todayDate = new Date();

            _.forEach(keys, function(key) {

                const dateString = keysManager.extractDate(key);

                if (!dateString) {
                    return;
                }

                let indexDate = new Date(dateString);
                indexDate.setDate(indexDate.getDate() + config.max_days);

                const ttl = Math.round((indexDate.getTime() - todayDate.getTime()) / 1000);

                debug('setKeysTTL: %ds for key %s', ttl, key);

                redis.expire(key, ttl);
            });
        });
    },


    /**
     * Init localScore variable
     */
    initLocalScoreStorage() {
        _.forEach(config.labels, function(label) {
            debug('set local storage for %s keys', label);
            localScore[label] = {};
        });
    },


    /**
     * Do batch increment from localScore to redis
     *
     * @param {String} label
     */
    batchIncrementFromLocalStorage(label) {
        
        const key = keysManager.indexKey(label, new Date());
        let updated = 0;
        
        _.forIn(localScore[label], function(score, id) {
            if (score) {
                counter.incrementInKey(key, id, score);
                localScore[label][id] = 0;
                updated++
            }
        });
        
        debug('updated %d keys for %s', updated, label);
    },


    /**
     * Increment score for label/id in redis
     *
     * @param {String} label
     * @param {String} id
     * @param {Number} score
     * @returns {*}
     */
    increment(label, id, score) {
        return this.incrementInKey(keysManager.indexKey(label, new Date()), (score || 1), id );
    },


    /**
     * Increment score for key/id in redis
     *
     * @param {String} key
     * @param {String} id
     * @param {Number} score
     * @returns {*}
     */
    incrementInKey(key, id, score) {
        return redis.zincrby(key, (score || 1), id );
    },


    /**
     * Increment score for label/id in localScore
     *
     * @param {String} label
     * @param {String} id
     * @param {Number} score
     */
    incrementLocal(label, id, score) {
        if (id in localScore[label]) {
            localScore[label][id] = localScore[label][id] + (score || 1);
        } else {
            localScore[label][id] = (score || 1);
        }
    },


    /**
     * Get label scores range
     *
     * @param {String} label
     * @param {Function} callback
     * @param {Number} limit
     * @returns {*}
     */
    range(label, callback, limit) {
        return redis.zrevrange(keysManager.mergedKey(label), 0, limit, function(err, ids){
            callback(ids);
        });
    },


    /**
     * Get label scores range for last {countDays}
     *
     * @param {Number} countDays
     * @param {String} label
     * @param {Function} callback
     * @param {Number} limit
     * @returns {*}
     */
    rangeByCountDays(countDays, label, callback, limit) {
        // TODO: Now only for one day
        if (countDays === 1) {
            return redis.zrevrange(keysManager.indexKey(label, new Date()), 0, limit, function (err, ids) {
                callback(ids);
            });
        } else {
            return this.range(label, callback, limit);
        }
    }

};


module.exports = counter;
