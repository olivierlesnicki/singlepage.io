var express = require('express');
var router = express.Router();
var _ = require('lodash');

var hosts = [
    'localhost:3000',
    'singlepage.io',
    'singlepage.co.vu'
];

router.use(function(req, res, next) {

    var host = req.headers.host;
    var protocol = req.socket.encrypted ? 'https' : 'http';

    // remove wwww
    if (/^www/.test(host)) {
        res.redirect(protocol + '://' + host.replace(/^www\./, '') + req.url);
        return next();
    };

    if (_.indexOf(hosts, host) !== -1) {
        return next();
    } else {

        var matches;

        for (var i = 0, n = hosts.length; i < n; i++) {
            matches = host.match(new RegExp('(.*)\.' + hosts[i]));
            if (matches) {
                break;
            }
        }

        if (matches && matches.length === 2) {
            request.url = '/domain/' + matches[1] + request.url;
            return next();
        } else {
            return next();
        }

    }

});

module.exports = router;
