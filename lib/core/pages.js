var Parse = require('./parse');
var Page = Parse.Object.extend('Page');
var Pages = Parse.Collection.extend({
    model: Page
});

module.exports = new Pages();
