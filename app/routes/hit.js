const express = require('express');
const debug   = require('debug')('http')
const counter = require('./../counter');
const config  = require('./../config')

const router = express.Router();

const zeroPixel = new Buffer('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');


function validateHitRequest(req) {

    if (!~config.projects.indexOf(req.params.project)) {
        return { code: 403, message: 'Project not allowed' };
    }

    return true;
}


router.get('/:project/:id', function(req, res) {

    const validateResult = validateHitRequest(req);

    if (validateResult !== true) {
        res.status(validateResult.code).end(validateResult.message);
        return;
    }

    counter.incrementLocal(req.params.project, req.params.id);

    debug('hit %s %d', req.params.project, req.params.id);

    // Return zero-pixel
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': zeroPixel.length
    });
    res.end(zeroPixel);
});

module.exports = router;