var assert = require("assert");
var pages = require('./../lib/core/pages');

describe('pages', function() {

    describe('#get()', function() {
        it('should return undefined when the page is not present', function() {
            assert.equal(pages.get('test'), undefined);
        });
    });

    describe('#add()', function() {
        it('should store the given page against its own domain', function() {

            // build a fake page
            var page = {
                name: 'pass',
                get: function() {
                    return 'test';
                }
            };

            assert.doesNotThrow(function() {
                pages.add(page)
            });

        });
    });

    describe('#get()', function() {
        it('should return the page when the page is present', function() {
            var page = pages.get('test');
            assert.equal(page.name, 'pass');
        });
    });

});
