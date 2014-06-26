var Parse = require('parse').Parse;

Parse.initialize(process.env.PARSE_APPLICATION_ID, process.env.PARSE_MASTER_KEY);

module.exports = Parse;