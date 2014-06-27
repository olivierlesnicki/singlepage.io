var Parse = require('./parse');
var Page = Parse.Object.extend('Page');

var Pages = function() {
    this.pages = {};
};
Pages.prototype = {
    add: function(page) {
        var domain = page.get('domain');
        this.pages[domain] = page;
        return this;
    },
    remove: function(domain) {
        delete this.pages[domain];
    },
    get: function(domain) {
        return this.pages[domain];
    }
}

module.exports = new Pages();
