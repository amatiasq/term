#!/usr/bin/env node
var spawn = require('child_process').spawn;
var convert = new (require('ansi-to-html'));
var bash = spawn('bash', ['-i']);

function print(data) {
  var result = data
    .split(' ')
    .map(convert.toHtml.bind(convert))
    .join(' ')
    .replace(/\n/g, '<br>');

  console.log(result);
}

bash.stdout.setEncoding('utf8');
bash.stdout.on('data', print);
bash.stderr.setEncoding('utf8');
bash.stderr.on('data', print);
bash.stdin.write('cd ../mq\n');
bash.stdin.write('git status\n');
