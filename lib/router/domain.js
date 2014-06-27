var express = require('express');
var path = require('path');
var Page = require('./../model/Page');
var Parse = require('./../core/parse');
var pages = require('./../core/pages');
var router = express.Router();

router.param('domain', function(req, res, next, domain) {

    if (pages.get(domain)) {
        next();
    } else {

        // retrieve page from Parse DB
        var queryPages = new Parse.Query(Page);

        queryPages
            .equalTo('domain', domain)
            .limit(1)
            .find()
            .then(function(results) {
                if (results && results.length) {
                    pages.add(results[0]);
                    next();
                } else {
                    res.send(404, 'Sorry, we cannot find that!');
                }
            }, function(err) {
                res.send(404, 'Sorry, we cannot find that!');
            });
    }

});

router.get('/:domain', function(req, res, next) {

    var domain = req.params.domain; // current domain
    var page = pages.get(domain);

    // render the single page app
    res.sendfile(page.getPath('index.html'));

});

router.get('/:domain/*', function(req, res, next) {

    var domain = req.params.domain; // current domain
    var page = pages.get(domain);
    var url = req.params[0];

    // check if url has 
    // a file extension
    if (url && url.match(/^.*\.[^\\]+$/)) {
        res.sendfile(page.getPath(url));
    } else {
        // render the single page app
        res.sendfile(page.getPath('index.html'));
    }

});

module.exports = router;
