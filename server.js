#!/usr/bin/env node
//jshint node:true
'use strict';

var spawn = require('child_process').spawn;
var express = require('express');
var app = express();
var server = app.listen(3001);
var io = require('socket.io').listen(server);
var isMac = process.env.TERM === 'xterm';

app.configure(function(){
  app.use(express.logger('dev'));
  app.use(express.static(__dirname));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

console.log('Express server listening on port 3001');

var special = {
  'ENTER': '\n',
  'TAB': '\t',
  'BACKSPACE': '\b',
  'ESCAPE': String.fromCharCode(27),
  'FILE_END': String.fromCharCode(3),
};

io.sockets.on('connection', function (socket) {
  console.log('[CONNECTED]');
  socket.emit('info', { msg: 'The world is round, there is no up or down.' });
  var shell = createShell();

  var input = 0;
  function macHack(data) {
    if (!isMac) return;

    if (data === '\b') {
      if (!input)
        return;
      input--;
    } else {
      input++;
      if (data === '\n')
        input = 0;
    }

    socket.emit('stdout', data);
  }

  socket.on('stdin', function(data) {
    if (data.length > 1) {
      if (special.hasOwnProperty(data))
        data = special[data];
      else
        return console.log('cant write', data);
    }

    macHack(data);
    console.log('[STDIN]', data.charCodeAt(0), data);
    shell.stdin.write(data);
  });

  shell.stdout.on('data', function(data) {
    console.log('[STDOUT]', data);
    socket.emit('stdout', data);
  });
  shell.stderr.on('data', function(data) {
    if (data.slice(0, 8) === '\x1b[?1034h')
      data = data.slice(8);

    console.log('[STDERR]', data);
    socket.emit('stderr', data);
  });
  shell.on('close', function(code) {
    console.log('[CLOSED]', code);
    socket.emit('closed', code);
  });

  socket.on('disconnect', function () {
    console.log('[DISCONNECTED]');
    shell.stdin.write('\nexit\n');
  });
});

function createShell() {
  var shell = spawn('bash', [ '-i' ]);
  shell.stdout.setEncoding('utf8');
  shell.stderr.setEncoding('utf8');
  return shell;
}

