var Parse = require('./parse');
var Page = Parse.Object.extend('Page');

var Pages = function() {
    this.pages = {};
};

Pages.prototype = {

    /**
     * Store a reference to the page
     * against its domain name
     * @param {Page} page
     * @return {this}
     */
    add: function(page) {
        var domain = page.get('domain');
        this.pages[domain] = page;
        return this;
    },

    /**
     * Remove a reference to a page
     * if it exists in the store
     * @param  {String} domain
     * @return {this}
     */
    remove: function(domain) {
        delete this.pages[domain];
        return this;
    },

    /**
     * Retrieve a page's reference
     * using its domain name
     * @param  {String} domain
     * @return {this}
     */
    get: function(domain) {
        return this.pages[domain];
    }

}

module.exports = new Pages();
