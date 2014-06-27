var Parse = require('./../core/parse');
var pages = require('./../core/pages');
var path = require('path');

var Page = Parse.Object.extend('Page', {
    getDirectoryPath: function() {
        var directoryPath = path.resolve(__dirname + '/../../domains/' + this.get('domain'));
        return directoryPath;
    },
    getPath: function(relativePath) {
        var path = this.getDirectoryPath() + '/' + relativePath;
        return path;
    }
});

module.exports = Page;
