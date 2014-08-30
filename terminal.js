var box = document.querySelector('#box')
var log = document.querySelector('#log')
var ansi = new AnsiParser();
var socket = io.connect();

function removeLastChar() {
  log.removeChild(log.lastChild);
}

function escapeHtml(a) {
  return a
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function receive(type, data) {
  if (data === '\b')
    return removeLastChar();

  var code = ansi.parse(data);
  var rendered = ansi.renderHtml(code);
  console.log('[' + type + ']', data, rendered);
  log.insertAdjacentHTML('beforeend', rendered);
  setTimeout(function() {
    document.body.scrollTop = document.body.scrollHeight;
  });
}

socket.on('stdout', receive.bind(null, 'STDOUT'));
socket.on('stderr', receive.bind(null, 'STDERR'));
socket.on('close', function(code) {
  console.log('[EXIT]', code);
  log.insertAdjacentHTML('beforeend', '<div>PROCESS EXIT</div>');
});


var input = 0;
function sendChar(character) {
  console.log('[STDIN]', character);
  socket.emit('stdin', character);
}
function parseChars(event) {
  var value = event.target.value;
  event.target.value = '';
  value.split('').forEach(sendChar);
}

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

document.addEventListener('click', box.focus.bind(box));
box.addEventListener('keypress', parseChars);
box.addEventListener('keydown', parseChars);
box.addEventListener('keyup', function(event) {
  var code = event.which;

  if (event.ctrlKey && code == 67) // CTRL+C
    return sendChar('FILE_END');

  if (special.hasOwnProperty(code)) {
    if (!special[code]) return;
    return sendChar(special[code]);
  }

  if (!event.target.value.length)
    return console.log('[CODE]', code);

  parseChars(event);
});

document.body.webkitRequestFullscreen()
