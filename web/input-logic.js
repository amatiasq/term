import socket from './socket';
import { Observable } from 'rx';

var special = {
  16: null, 17: null, 18: null, 20: null, 91: null, 93: null,
  112: 'F1', 113: 'F2', 114: 'F3', 115: 'F4', 116: 'F5', 117: 'F6',
  118: 'F7', 119: 'F8', 120: 'F9', 121: 'F10', 122: 'F11', 123: 'F12',
  33: 'PAGEUP', 34: 'PAGEDOWN',
  36: 'HOME', 35: 'END',
  45: 'INSERT', 46: 'DELETE',
  37: 'LEFT', 38: 'UP', 39: 'RIGHT', 40: 'DOWN',
  8: 'BACKSPACE', 9: 'TAB', 13: 'ENTER', 27: 'ESCAPE',
};

function stopPropagation(event) {
  event.stopPropagation()
  return event;
}

function getTypedChars(event) {
  var value = event.target.value;
  event.target.value = '';
  return Observable.fromArray(value.split(''));
}

function specialKeysParser(event) {
  var code = event.which;

  if (event.ctrlKey && code == 67) // CTRL+C
    return 'FILE_END';

  if (special.hasOwnProperty(code))
    return special[code];
}

var $box = document.querySelector('#box');
var keyup = Observable.fromEvent($box, 'keyup');

var specialKeys = keyup
  .map(specialKeysParser)
  .filter(Boolean);

var keyboard = keyup
  .concat(
    Observable.fromEvent($box, 'keypress'),
    Observable.fromEvent($box, 'keydown')
  )
  .map(stopPropagation)
  .flatMap(getTypedChars)
  .filter(Boolean);

var server = Observable.merge(keyboard, specialKeys);
server.subscribe(data => socket.emit('stdin', data));

export default server;
