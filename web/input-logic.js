import Stream from './tools/simple-stream';
import socket from './socket';

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

class StopPropagation extends Stream {
  write(event) {
    event.stopPropagation();
    this._write(event);
  }
}

class SpecialKeysParser extends Stream {
  write(event) {
    var code = event.which;

    if (event.ctrlKey && code == 67) // CTRL+C
      return this._write('FILE_END');

    if (special.hasOwnProperty(code)) {
      if (!special[code]) return;
      return this._write(special[code]);
    }

    if (!event.target.value.length)
      return console.log('[CODE]', code);
  }
}

class KeyboardParser extends Stream {
  write(event) {
    var value = event.target.value;
    event.target.value = '';
    value.split('').forEach(character => this._write(character));
  }
}

class ServerStream extends Stream {
  write(data) {
    //console.log('[STDIN]', data);
    socket.emit('stdin', data);
  }
}

var $box = document.querySelector('#box');
var server = new ServerStream();
var keyboard = new KeyboardParser();
var keyup = Stream.fromDomEvent($box, 'keyup');

Stream.fromDomEvent($box, 'keypress')
  .pipe(new StopPropagation())
  .pipe(keyboard);
Stream.fromDomEvent($box, 'keydown')
  .pipe(new StopPropagation())
  .pipe(keyboard);

keyup
  .pipe(new StopPropagation())
  .pipe(keyboard)
  .pipe(server);
keyup
  .pipe(new SpecialKeysParser())
  .pipe(server);

export default server;
