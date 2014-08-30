#!/usr/bin/env node
//jshint node:true
'use strict';

var spawn = require('child_process').spawn;
var express = require('express');
var socketIO = require('socket.io');
var errorhandler = require('errorhandler');

var app = express();
var isMac = process.env.TERM === 'xterm';
var server = app.listen(3001, function() {
  console.log('Express server listening on port 3001');
}, console.error);
var io = socketIO.listen(server);

app.use(errorhandler());
app.use(express.static(__dirname));

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
  var shell = createShell(socket);

  function macHack(data) {
    if (isMac) socket.emit('stdout', data);
  }

  socket.on('disconnect', shell.kill.bind(shell));

  socket.on('stdin', function(data) {
    if (data.length > 1) {
      if (special.hasOwnProperty(data))
        data = special[data];
      else
        return console.log('cant write', data);
    }

    //macHack(data);
    console.log('[STDIN]', data.charCodeAt(0), data);
    shell.stdin.write(data);
  });

  shell.stdout.on('data', function(data) {
    console.log('[STDOUT]', data);
    socket.emit('stdout', data);
  });
  shell.stderr.on('data', function(data) {
    //if (data.slice(0, 8) === '\x1b[?1034h')
    //  data = data.slice(8);

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

function createShell(socket) {
  var shell = spawn('bash', [ '-i' ]);
  shell.stdout.setEncoding('utf8');
  shell.stderr.setEncoding('utf8');

  var intro = 'alias ssh="ssh -t -t"\n';
  shell.stdin.write(intro);
  //socket.emit('stdout', intro);
  return shell;
}

