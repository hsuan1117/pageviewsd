const express    = require('express');
const counter    = require('./../counter');
const config     = require('./../config');
const eachSeries = require('async/eachSeries');

const router = express.Router();

router.get('/', function(req, res) {

    res.setHeader('Content-Type', 'application/json');

    const stats = { indexes: {} };

    eachSeries(config.labels, function(label, callback) {

        counter.getKeys(label, function(keys){

            eachSeries(keys, function(key, callback2){

                stats.indexes[key] = {};

                counter.getKeyScores(key, function(scores){
                    stats.indexes[key]['top-20'] = scores;
                    callback2();
                }, 20);


            }, function(){
                callback();
                res.json(stats);
            });
        });

    }, function(){
        res.json(stats);
    });



});

module.exports = router;