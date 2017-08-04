const express = require('express');
const debug   = require('debug')('http')
const counter = require('./../counter');
const config  = require('./../config')

const router = express.Router();

const zeroPixel = new Buffer('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');


function validateHitRequest(req) {

    if (! ('p' in req.query)) {
        return { code: 400, message: 'Project required: p' };
    }

    if (!~config.projects.indexOf(req.query.p)) {
        return { code: 403, message: 'Project not allowed' };
    }

    if (! ('i' in req.query)) {
        return { code: 400, message: 'ID required: i' };
    }

    return true;
}


router.get('/', function(req, res) {

    const validateResult = validateHitRequest(req);

    if (validateResult !== true) {
        res.status(validateResult.code).end(validateResult.message);
        return;
    }

    counter.increment(req.query.p, req.query.i);

    debug('hit %s %d', req.query.p, req.query.i);

    // Return zero-pixel
    res.writeHead(200, {
        'Content-Type': 'image/gif',
        'Content-Length': zeroPixel.length
    });
    res.end(zeroPixel);
});

module.exports = router;