define(function(require, exports, module) {

    'use strict';

    var _ = require('underscore');
    var Backbone = require('backbone');
    var bus = {};

    _.extend(bus, Backbone.Events);

    return bus;

});
