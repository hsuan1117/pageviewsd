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

    counter.getKeyScores(req.params.label, function(ids){
        res.json(ids);
    });
}


router.get('/:label/:days(\\d+)', requestHandler);
router.get('/:label', requestHandler);

module.exports = router;