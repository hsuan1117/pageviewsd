const redis = require('./redis');
const config = require('./config');
const debug = require('debug')('counter')
const _ = require('lodash');


const localScore = {};


const counter = {

    indexKey(project, date) {
        return project + '-' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    },

    mergedKey(project) {
        return project + '-merged';
    },

    getKeys(project, callback) {
        return redis.keys(project + '*', function(err, keys){
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

    mergeKeys(project) {
        this.getKeys(project, function(keys) {

            const numberKeys = keys.length;

            if (!numberKeys) {
                debug('mergeKeys: no keys for %s', project);
                return;
            }

            const mergedKey = counter.mergedKey(project);
            keys.unshift(mergedKey, numberKeys);
            redis.del(mergedKey);
            redis.zunionstore.apply(redis, keys);
        })
    },

    setKeysTTL() {
        _.forEach(config.projects, function(project) {
            debug('set ttl for %s keys', project);
            for (let i = 0; i < config.max_days; i++) {
                let date = new Date();
                date.setDate(date.getDate() - i);
                const ttl = ((config.max_days-i)*86400 - (date.getHours()*3600));
                redis.expire(counter.indexKey(project, date), ttl );
            }
        });
    },

    initLocalScoreStorage() {
        _.forEach(config.projects, function(project) {
            debug('set local storage for %s keys', project);
            localScore[project] = {};
        });
    },

    batchIncrementFromLocalStorage(project) {
        
        const key = this.indexKey(project, new Date());
        let updated = 0;
        
        _.forIn(localScore[project], function(score, id) {
            if (score) {
                counter.incrementInKey(key, id, score);
                localScore[project][id] = 0;
                updated++
            }
        });
        
        debug('updated %d keys for %s', updated, project);
    },

    increment(project, id, score) {
        return this.incrementInKey(this.indexKey(project, new Date()), (score || 1), id );
    },

    incrementInKey(key, id, score) {
        return redis.zincrby(key, (score || 1), id );
    },

    incrementLocal(project, id, score) {
        if (id in localScore[project]) {
            localScore[project][id] = localScore[project][id] + (score || 1);
        } else {
            localScore[project][id] = (score || 1);
        }
    },

    range(project, callback, limit) {
        return redis.zrevrange(this.mergedKey(project), 0, limit, function(err, ids){
            callback(ids);
        });
    }

};


module.exports = counter;