const express    = require('express');
const counter    = require('./../counter');
const config     = require('./../config');
const eachSeries = require('async/eachSeries');

const router = express.Router();

router.get('/', function(req, res) {

    res.setHeader('Content-Type', 'application/json');

    const stats = { indexes: {} };

    counter.getAllKeys(function(keys){

        eachSeries(keys, function(key, callback){

            stats.indexes[key] = {};

            counter.getKeyScores(key, function(scores){
                stats.indexes[key]['top-20'] = scores;
                callback();
            }, 20);


        }, function(){
            res.json(stats);
        });
    });

});

module.exports = router;