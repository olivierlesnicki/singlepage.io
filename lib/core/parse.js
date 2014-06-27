var Parse = require('parse').Parse;

// intialize Parse
Parse.initialize(process.env.PARSE_APPLICATION_ID, process.env.PARSE_JAVASCRIPT_KEY, process.env.PARSE_MASTER_KEY);

module.exports = Parse;
