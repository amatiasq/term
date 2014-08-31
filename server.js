#!/usr/bin/env node
//jshint node:true
'use strict';

var fs = require('fs');
var express = require('express');
var app = require('./srv/app').app;
var socket = require('./srv/socket');
var errorhandler = require('errorhandler');

app.use(errorhandler());
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/web', express.static(__dirname + '/web'));
app.use('*', function(req, res) {
  fs.createReadStream('index.html').pipe(res);
});
