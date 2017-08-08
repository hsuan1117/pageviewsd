const redis  = require('./redis');
const config = require('./config');
const debug  = require('debug')('counter')
const _      = require('lodash');


const localScore = {};


const counter = {

    indexKey(label, date) {
        return label + '-' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    },

    mergedKey(label) {
        return label + '-merged';
    },

    getKeys(label, callback) {
        return redis.keys(label + '*', function(err, keys){
            if (!err) {
                callback(keys);
            }
        });
    },

    getAllKeys(callback) {
        return redis.keys('*', function(err, keys){
            if (!err) {
                callback(keys);
            }
        });
    },

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

    mergeKeys(label) {
        this.getKeys(label, function(keys) {

            const numberKeys = keys.length;

            if (!numberKeys) {
                debug('mergeKeys: no keys for %s', label);
                return;
            }

            const mergedKey = counter.mergedKey(label);
            keys.unshift(mergedKey, numberKeys);
            redis.del(mergedKey);
            redis.zunionstore.apply(redis, keys);
        })
    },

    setKeysTTL() {
        _.forEach(config.labels, function(label) {
            debug('set ttl for %s keys', label);
            for (let i = 0; i < config.max_days; i++) {
                let date = new Date();
                date.setDate(date.getDate() - i);
                const ttl = ((config.max_days-i)*86400 - (date.getHours()*3600));
                redis.expire(counter.indexKey(label, date), ttl );
            }
        });
    },

    initLocalScoreStorage() {
        _.forEach(config.labels, function(label) {
            debug('set local storage for %s keys', label);
            localScore[label] = {};
        });
    },

    batchIncrementFromLocalStorage(label) {
        
        const key = this.indexKey(label, new Date());
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

    increment(label, id, score) {
        return this.incrementInKey(this.indexKey(label, new Date()), (score || 1), id );
    },

    incrementInKey(key, id, score) {
        return redis.zincrby(key, (score || 1), id );
    },

    incrementLocal(label, id, score) {
        if (id in localScore[label]) {
            localScore[label][id] = localScore[label][id] + (score || 1);
        } else {
            localScore[label][id] = (score || 1);
        }
    },

    range(label, callback, limit) {
        return redis.zrevrange(this.mergedKey(label), 0, limit, function(err, ids){
            callback(ids);
        });
    }

};


module.exports = counter;