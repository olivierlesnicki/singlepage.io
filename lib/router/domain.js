var parseurl = require('parseurl');
var express = require('express');
var Parse = require('./../core/parse');
var pages = {};
var router = express.Router();

router.param('domain', function(req, res, next, domain){

    if(pages[domain]) {
        next();
    } else {
        
        // retrieve page from Parse DB
        var queryPages = new Parse.Query('Page');
        queryPages
            .equalTo('domain', domain)
            .limit(1)
            .find(function(results){
                if(results.length) {
                    pages[domain] = results[0];
                    next();
                } else {
                res.send(404, 'Sorry, we cannot find that!');
                }
            }, function(){
                res.send(404, 'Sorry, we cannot find that!');
            });
    }
    
});

router.get('/:domain', function(req, res, next){
    
    var domain = req.params.domain; // current domain

    // render the single page app
    res.sendfile('domain/' + domain + '/index.html');
    
});

router.get('/:domain/*', function(req, res, next){
    
    var domain = req.params.domain; // current domain
    var path = req.params[0];
    
    // check if url has 
    // a file extension
    if(path && path.match(/^.*\.[^\\]+$/)) {
        res.sendfile('domain/' + domain + '/' + path);
    } else {
        // render the single page app
        res.sendfile('domain/' + domain + '/index.html');
    }
    
});

module.exports = router;