#!/usr/bin/env node

var datasource = require('./lib/datasource');
var Bacon = require("baconjs").Bacon;


  var server = require('http').createServer(function (request, response) {
    request.addListener('end',function () {
      new (require('node-static')).Server(__dirname + '/webapp/').serve(request, response);
    }).resume();
  });
  server.listen(8999);

  var primus = new require('primus')(server, {
    parser: 'JSON'
  });

var datastream = new Bacon.Bus();

datasource.create(datastream.push);

var throttledStream = datastream.throttle(500);

primus.on('connection', function (spark) {
  spark['unsubscribe'] = [];
  spark['unsubscribe'].push(throttledStream.subscribe(function (event) {
    spark.write(event.value());
  }));
});

primus.on('disconnection', function (spark) {
  spark['unsubscribe'].map(function (unsubscribeF) {
    unsubscribeF();
  });
});