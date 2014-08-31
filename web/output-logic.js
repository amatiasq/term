import Stream from './tools/simple-stream';
//import StreamLogger from './tools/stream-logger';
import AnsiParser from './tools/ansi-parser';
import socket from './socket';

var output = new Stream();
var stdout = Stream.fromEvent(socket, 'stdout');
var stderr = Stream.fromEvent(socket, 'stderr');

stderr
	.pipe(new AnsiParser())
	//.pipe(new StreamLogger('[STDERR]'))
	.pipe(output);
stdout
	.pipe(new AnsiParser())
	//.pipe(new StreamLogger('[STDOUT]'))
	.pipe(output);

socket.on('close', code => {
  stdout.end();
  stderr.end();
  console.log('[EXIT]', code);
});

export default output;
