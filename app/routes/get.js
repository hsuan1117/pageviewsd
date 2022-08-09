const express = require('express');
const counter = require('./../counter');
const config = require('./../config');
const router = express.Router();


function requestHandler(req, res) {

    res.setHeader('Content-Type', 'application/json');

    if (!~config.labels.indexOf(req.params.label)) {
        res.status(403).json({error: 'Label not allowed'});
        return;
    }

    counter.getKeyScores(req.params.label + '-merged', function (ids) {
        if (req.params.id) {
            res.json(Object.keys(ids).filter(x => ids[x].id === req.params.id).map(x => ids[x])[0]);
        } else {
            res.json(Object.keys(ids).map(x => ids[x]));
        }
    });
}


router.get('/:label/:id', requestHandler);
router.get('/:label', requestHandler);

module.exports = router;