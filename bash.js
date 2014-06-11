#!/usr/bin/env node
//jshint node:true
'use strict';
var bash = require('child_process').spawn('bash', ['-i']);
process.stdin.pipe(bash.stdin);
bash.stdout.pipe(process.stdout);
bash.stderr.pipe(process.stderr);
