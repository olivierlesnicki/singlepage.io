require.config({
    paths: {
        backbone: '../bower_components/backbone/backbone',
        jquery: '../bower_components/jquery/dist/jquery',
        text: '../bower_components/text/text',
        underscore: '../bower_components/underscore/underscore',
        ractive: '../bower_components/ractive/ractive',
        'ractive.backbone': '../bower_components/ractive-backbone/Ractive-Backbone'
    }
});

define(function(require, exports, module) {

    'use strict';

    var bus = require('core/bus');
    var client = require('core/client');
    var Parse = require('core/parse');

    require('ui/header');
    require('ui/apps');

    bus.on('actionSignIn', function() {
        client.authenticate(function(err, client) {
            if (!err) {
                var credentials = client.credentials();
                Parse.Cloud
                    .run('logInWithDropbox', {
                        accessToken: credentials.token,
                        dropboxId: credentials.uid
                    })
                    .then(function(data) {
                        Parse.User
                            .become(data.sessionToken)
                            .then(function() {
                                bus.trigger('signedIn');
                            });
                    });
            }
        });
    });

    bus.on('actionSignOut', function() {
        Parse.User.logOut();
        window.location.reload();
    });

    if (Parse.User.current()) {
        bus.trigger('signedIn');
    }

});
