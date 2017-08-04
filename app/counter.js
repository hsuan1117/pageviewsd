const redis = require('./redis');
const config = require('./config');
const _ = require('lodash');


const localScore = {};

module.exports = {


    indexKey(project, date) {
        return project + '-' + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay();
    },

    getKeys(project, callback) {
        return redis.keys(project + '*', function(err, keys){
            callback(keys);
        });
    },

    getAllKeys(callback) {
        return redis.keys('*', function(err, keys){
            callback(keys);
        });
    },

    getKeyScores(key, callback, limit) {
        return redis.zrevrange(key, 0, (limit || -1), 'WITHSCORES', function(err, response){
            callback(_.invert(_.fromPairs(_.chunk(response, 2))));
        });
    },

    mergeKeys(project) {
        this.getKeys(project, function(keys) {
            // console.log(keys);
            // keys.unshift(project + '-merged');
            // redis.zinterstore.apply(redis, keys);
        })
    },


    increment(project, id, score) {
        return redis.zincrby(this.indexKey(project, new Date()), (score || 1), id );
    }


};