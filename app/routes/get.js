const express = require('express');
const counter = require('./../counter');
const config  = require('./../config');
const router  = express.Router();


function requestHandler(req, res) {

    res.setHeader('Content-Type', 'application/json');

    if (!~config.labels.indexOf(req.params.label)) {
        res.status(403).json({ error: 'Label not allowed' });
        return;
    }

    const limit = Math.min(
        (('limit' in req.query) ? new Number(req.query.limit).toString() : 10),
        config.max_get_limit
    );

    if (!limit) {
        res.json({ ids: [] });
        return;
    }

    if ('days' in req.params) {
        // Return for req.params.days period
        counter.rangeByCountDays(parseInt(req.params.days), req.params.label, function(ids){
            res.json(ids);
        }, limit);
    } else {
        // Return range for config.max_days period
        counter.range(req.params.label, function(ids){
            res.json(ids);
        }, limit);
    }
}


router.get('/:label/:days(\\d+)', requestHandler);
router.get('/:label', requestHandler);

module.exports = router;