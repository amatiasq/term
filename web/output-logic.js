import { Observable } from 'rx';
import AnsiParser from './tools/ansi-parser';
import socket from './socket';

var stdout = Observable.fromEvent(socket, 'stdout')
  .map(new AnsiParser())
  .flatMap(Observable.fromArray);
var stderr = Observable.fromEvent(socket, 'stderr')
  .map(new AnsiParser())
  .flatMap(Observable.fromArray);

var close = Observable.fromEvent(socket, 'close');
var output = Observable.merge(stdout, stderr).takeUntil(close);

close.subscribe(code => console.log(`[EXIT] ${code}`));

export default output;
