define(function(require, exports, module) {

    'use strict';

    var Parse = require('core/parse');

    var client = new Dropbox.Client({
        key: "fvxzgbotrjp3kk4"
    });

    return client;

});
