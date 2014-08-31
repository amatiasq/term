//jshint node:true
'use strict';

var spawn = require('child_process').spawn;
var socketIO = require('socket.io');
var server = require('./app').server;
var io = socketIO.listen(server);
var isMac = require('os').platform() === 'darwin';

var special = {
  'ENTER': '\n',
  'TAB': '\t',
  'BACKSPACE': '\b',
  'ESCAPE': String.fromCharCode(27),
  'FILE_END': String.fromCharCode(3),
};

io.sockets.on('connection', function (socket) {
  console.log('[CONNECTED]');
  var shell = createShell(socket);

  socket.on('stdin', function(data) {
    if (special.hasOwnProperty(data))
      data = special[data];

    console.log('[STDIN]', data.charCodeAt(0), data);
    shell.stdin.write(data);

    if (isMac)
      socket.emit('stdout', data);
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

  //var intro = 'alias ssh="ssh -t -t"\n';
  //shell.stdin.write(intro);
  return shell;
}

exports.io = io;
