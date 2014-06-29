var express = require('express');
var router = express.Router();
var request = require('request');
var Parse = require('./../core/parse');
var Buffer = require('buffer').Buffer;
var querystring = require('querystring');
var _ = require('lodash');

var dropboxClientId = process.env.DROPBOX_CLIENT_ID;
var dropboxClientSecret = process.env.DROPBOX_CLIENT_SECRET;

var dropboxRedirectEndpoint = 'https://www.dropbox.com/1/oauth2/authorize?';
var dropboxValidateEndpoint = 'https://api.dropbox.com/1/oauth2/token';
var dropboxUserEndpoint = 'https://api.dropbox.com/1/account/info';

var TokenRequest = Parse.Object.extend("TokenRequest");
var TokenStorage = Parse.Object.extend("TokenStorage");

var restrictedAcl = new Parse.ACL();
restrictedAcl.setPublicReadAccess(false);
restrictedAcl.setPublicWriteAccess(false);

router.get('/authorize', function(req, res, next) {

    var tokenRequest = new TokenRequest();

    // Secure the object against public access.
    tokenRequest.setACL(restrictedAcl);

    // Save this request in a Parse Object for validation when Dropbox responds
    // Use the master key because this class is protected
    tokenRequest.save(null, {
        useMasterKey: true
    }).then(function(obj) {

        // Redirect the browser to Dropbox for authorization.
        // This uses the objectId of the new TokenRequest as the 'state'
        // variable in the Dropbox redirect.
        res.redirect(
            dropboxRedirectEndpoint + querystring.stringify({
                response_type: 'code',
                client_id: dropboxClientId,
                redirect_uri: 'http://localhost:3000/user/oauthCallback',
                force_reapprove: false,
                state: obj.id
            })
        );

    }, function(err) {
        next(err);
    });

});

router.get('/oauthCallback', function(req, res, next) {


    var data = req.query;
    var token;

    // Validate that code and state have been passed in as query parameters.
    // Render an error page if this is invalid.
    if (!(data && data.code && data.state)) {
        return next(new Error('Invalid auth response received.'));
    }

    var query = new Parse.Query(TokenRequest);

    // Check if the provided state object exists as a TokenRequest
    // Use the master key as operations on TokenRequest are protected
    Parse.Cloud.useMasterKey();

    Parse.Promise.as().then(function() {
        return query.get(data.state);
    }).then(function(obj) {

        // Destroy the TokenRequest before continuing.
        return obj.destroy();

    }).then(function() {

        // Validate & Exchange the code parameter for an access token from Dropbox
        return getDropboxAccessToken(data.code);

    }).then(function(dropboxData) {

        // Process the response from Dropbox, return either the getDropboxUserDetails
        // promise, or reject the promise.

        if (dropboxData && dropboxData.access_token && dropboxData.token_type) {

            token = dropboxData.access_token;
            return getDropboxUserDetails(token);

        } else {
            return Parse.Promise.error("Invalid access request.");
        }

    }).then(function(userData) {

        // Process the users Dropbox details, return either the upsetDropboxUser
        // promise, or reject the promise.

        if (userData && userData.uid) {
            return upsertDropboxUser(token, userData);
        } else {
            return Parse.Promise.error("Unable to parse Dropbox data");
        }

    }).then(function(user) {

        console.log('user', user);

        // Render a page which sets the current user on the client-side and then
        // redirects to /

        res.render('store', {
            sessionToken: user.getSessionToken()
        });

    }, function(error) {

        // If the error is an object error (e.g. from a Parse function) convert it
        // to a string for display to the user.

        if (error && error.code && error.error) {
            error = error.code + ' ' + error.error;
        }

        next(new Error(JSON.stringify(error)));

    });


});

/**
 * This function is called when Dropbox redirects the user back after
 * authorization.  It calls back to Dropbox to validate and exchange the code
 * for an access token.
 * @param  {String} code
 * @return {Promise}
 */
var getDropboxAccessToken = function(code) {

    var promise = new Parse.Promise();

    request.post({
        url: dropboxValidateEndpoint,
        form: {
            client_id: dropboxClientId,
            client_secret: dropboxClientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: 'http://localhost:3000/user/oauthCallback'
        },
        json: true
    }, function(error, response, dropboxData) {
        if (error || response.statusCode !== 200) {
            promise.reject(error);
        } else {
            promise.resolve(dropboxData);
        }
    });

    return promise;

}

/**
 * This function calls the dropboxUserEndpoint to get the user details for the
 * provided access token, returning the promise from the httpRequest.
 * @param  {String} accessToken
 * @return {Promise}
 */
var getDropboxUserDetails = function(accessToken) {

    var promise = new Parse.Promise();
    var url = dropboxUserEndpoint;

    url += '?';
    url += querystring.stringify({
        access_token: accessToken
    });

    request.get({
        url: url,
        json: true
    }, function(error, response, userData) {
        if (error || response.statusCode !== 200) {
            promise.reject(error);
        } else {
            promise.resolve(userData);
        }
    });

    return promise;

}

/**
 * This function checks to see if this GitHub user has logged in before.
 * If the user is found, update the accessToken (if necessary) and return
 * the users session token.  If not found, return the newDropboxUser promise.
 * @param  {String} accessToken
 * @param  {Object} dropboxData
 * @return {Promise}
 */
var upsertDropboxUser = function(accessToken, dropboxData) {

    var query = new Parse.Query(TokenStorage);
    query.equalTo('dropboxId', dropboxData.uid);
    query.ascending('createdAt');

    // Check if this dropboxId has previously logged in, using the master key
    return query.first({
        useMasterKey: true
    }).then(function(tokenData) {

        // If not, create a new user.
        if (!tokenData) {
            return newDropboxUser(accessToken, dropboxData);
        }

        // If found, fetch the user.
        var user = tokenData.get('user');

        return user.fetch({
            useMasterKey: true
        }).then(function(user) {

            // Update the accessToken if it is different.
            if (accessToken !== tokenData.get('accessToken')) {
                tokenData.set('accessToken', accessToken);
            }

            // This save will not use an API request if the token was not changed.
            // e.g. when a new user is created and upsert is called again.
            return tokenData.save(null, {
                useMasterKey: true
            });

        }).then(function(obj) {
            // Return the user object.
            return Parse.Promise.as(user);
        });

    });
};

/**
 * This function creates a Parse User with a random login and password, and
 * associates it with an object in the TokenStorage class.
 * Once completed, this will return upsertDropboxData.  This is done to protect
 * against a race condition:  In the rare event where 2 new users are created
 * at the same time, only the first one will actually get used.
 * @param  {String} accessToken
 * @param  {Object} dropboxData
 * @return {Promise}
 */
var newDropboxUser = function(accessToken, dropboxData) {

    var user = new Parse.User();

    // Generate a random username and password.
    var username = new Buffer(24);
    var password = new Buffer(24);

    _.times(24, function(i) {
        username.set(i, _.random(0, 255));
        password.set(i, _.random(0, 255));
    });

    user.set("username", username.toString('base64'));
    user.set("password", password.toString('base64'));

    // Sign up the new User
    return user.signUp().then(function(user) {

        // create a new TokenStorage object to store the user+GitHub association.
        var ts = new TokenStorage();
        ts.set('dropboxId', dropboxData.uid);
        ts.set('accessToken', accessToken);
        ts.set('user', user);
        ts.setACL(restrictedAcl);

        // Use the master key because TokenStorage objects should be protected.
        return ts.save(null, {
            useMasterKey: true
        });

    }).then(function(tokenStorage) {
        return upsertDropboxUser(accessToken, dropboxData);
    });

}


module.exports = router;
