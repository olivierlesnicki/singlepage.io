define(function(require, exports, module) {

    'use strict';

    var bus = require('core/bus');
    var Ractive = require('ractive');

    var UI = Ractive.extend({
        bus: bus
    });

    return UI;

});
