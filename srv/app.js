//jshint node:true
'use strict';

var fs = require('fs');
var express = require('express');
var errorhandler = require('errorhandler');
var app = express();
var server = app.listen(3001, console.log, console.error);

console.log('Express server listening on port 3001');

exports.app = app;
exports.server = server;
