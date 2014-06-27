var assert = require("assert");
var path = require("path");
var Page = require('./../lib/model/Page');

describe('Page', function() {

    describe('#getDirectoryPath()', function() {
        it('should return the path of the folder for this page', function() {
            var page = new Page({
                domain: 'pass'
            });
            var directoryPath = path.resolve(__dirname + '/../domains/pass');
            assert.equal(page.getDirectoryPath(), directoryPath);
        });
    });


    describe('#getPath()', function() {
        it('should return the absolute path of the relative path provided', function() {
            var page = new Page({
                domain: 'pass'
            });
            var absolutePath = path.resolve(__dirname + '/../domains/pass/index.html');
            assert.equal(page.getPath('index.html'), absolutePath);
        });
    });


});
