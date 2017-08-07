const express = require('express');
const counter = require('./../counter');
const config  = require('./../config');
const router  = express.Router();


router.get('/:project', function(req, res) {

    res.setHeader('Content-Type', 'application/json');

    if (!~config.projects.indexOf(req.params.project)) {
        res.status(403).json({ error: 'Project not allowed' });
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

    counter.range(req.params.project, function(ids){
        res.json({
            ids: ids
        });
    }, limit);
    
});

module.exports = router;