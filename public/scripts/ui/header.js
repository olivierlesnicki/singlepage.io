define(function(require, exports, module) {

    'use strict';

    var UI = require('core/ui');
    var template = require('text!template/header.html');

    var header = new UI({
        el: 'header',
        template: template,
        data: {
            isUserSignedIn: false
        }
    });

    header.on({
        signIn: function() {
            this.bus.trigger('actionSignIn');
        },
        signOut: function() {
            this.bus.trigger('actionSignOut');
        }
    });

    header.bus.on('signedIn', function() {
        this.set('isUserSignedIn', true);
    }, header);

    return header;

});
