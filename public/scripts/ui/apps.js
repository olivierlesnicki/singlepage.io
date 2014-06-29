define(function(require, exports, module) {

    'use strict';

    var UI = require('core/ui');
    var template = require('text!template/apps.html');

    var apps = new UI({
        el: '.apps-ui',
        template: template,
        data: {
            isCreateAppModalOpened: false
        }
    });

    apps.on({
        openCreateAppModal: function() {
            this.set('isCreateAppModalOpened', true);
        },
        closeCreateAppModal: function() {
            this.set('isCreateAppModalOpened', false);
        }
    });

    return apps;

});
