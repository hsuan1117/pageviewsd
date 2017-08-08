const express = require('express');
const counter = require('./../counter');
const config  = require('./../config');
const router  = express.Router();


router.get('/:label', function(req, res) {

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

    counter.range(req.params.label, function(ids){
        res.json({
            ids: ids
        });
    }, limit);
    
});

module.exports = router;