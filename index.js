var express = require('express');
var app = express();
var router = express.Router();
var domainRouter = require('./lib/router/domain');

app.use('/domain', domainRouter);

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(process.env.PORT);
