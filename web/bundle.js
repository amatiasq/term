(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Stream = require('./tools/simple-stream').default;
var socket = require('./socket').default;
function send(data) {
  console.log('[STDIN]', data);
  socket.emit('stdin', data);
}
var special = {
  16: null,
  17: null,
  18: null,
  20: null,
  91: null,
  93: null,
  112: 'F1',
  113: 'F2',
  114: 'F3',
  115: 'F4',
  116: 'F5',
  117: 'F6',
  118: 'F7',
  119: 'F8',
  120: 'F9',
  121: 'F10',
  122: 'F11',
  123: 'F12',
  33: 'PAGEUP',
  34: 'PAGEDOWN',
  36: 'HOME',
  35: 'END',
  45: 'INSERT',
  46: 'DELETE',
  37: 'LEFT',
  38: 'UP',
  39: 'RIGHT',
  40: 'DOWN',
  8: 'BACKSPACE',
  9: 'TAB',
  13: 'ENTER',
  27: 'ESCAPE'
};
var StopPropagation = function StopPropagation() {
  $traceurRuntime.defaultSuperCall(this, $StopPropagation.prototype, arguments);
};
var $StopPropagation = StopPropagation;
($traceurRuntime.createClass)(StopPropagation, {write: function(event) {
    event.stopPropagation();
    this._write(event);
  }}, {}, Stream);
var SpecialKeysParser = function SpecialKeysParser() {
  $traceurRuntime.defaultSuperCall(this, $SpecialKeysParser.prototype, arguments);
};
var $SpecialKeysParser = SpecialKeysParser;
($traceurRuntime.createClass)(SpecialKeysParser, {write: function(event) {
    var code = event.which;
    if (event.ctrlKey && code == 67)
      return this._write('FILE_END');
    if (special.hasOwnProperty(code)) {
      if (!special[code])
        return;
      return this._write(special[code]);
    }
    if (!event.target.value.length)
      return console.log('[CODE]', code);
  }}, {}, Stream);
var KeyboardParser = function KeyboardParser() {
  $traceurRuntime.defaultSuperCall(this, $KeyboardParser.prototype, arguments);
};
var $KeyboardParser = KeyboardParser;
($traceurRuntime.createClass)(KeyboardParser, {write: function(event) {
    var $__2 = this;
    var value = event.target.value;
    event.target.value = '';
    value.split('').forEach((function(character) {
      return $__2._write(character);
    }));
  }}, {}, Stream);
var ServerStream = function ServerStream() {
  $traceurRuntime.defaultSuperCall(this, $ServerStream.prototype, arguments);
};
var $ServerStream = ServerStream;
($traceurRuntime.createClass)(ServerStream, {write: function(data) {
    console.log('[STDIN]', data);
    socket.emit('stdin', data);
  }}, {}, Stream);
var $box = document.querySelector('#box');
var server = new ServerStream();
var keyboard = new KeyboardParser();
var keyup = Stream.fromDomEvent($box, 'keyup');
Stream.fromDomEvent($box, 'keypress').pipe(new StopPropagation()).pipe(keyboard);
Stream.fromDomEvent($box, 'keydown').pipe(new StopPropagation()).pipe(keyboard);
keyup.pipe(new StopPropagation()).pipe(keyboard).pipe(server);
keyup.pipe(new SpecialKeysParser()).pipe(server);
var $__default = server;


},{"./socket":4,"./tools/simple-stream":8}],2:[function(require,module,exports){
"use strict";
var Stream = require('./tools/simple-stream').default;
var HtmlRenderer = require('./tools/html-renderer').default;
var output = require('./output-logic').default;
var input = require('./input-logic').default;
var renderer = new HtmlRenderer();
var $log = document.querySelector('#log');
renderer.fromAnsiStream($log, output);
var $box = document.querySelector('#box');
document.addEventListener('click', (function(event) {
  return $box.focus();
}));
output.on('data', scrollBottom);
function scrollBottom() {
  setTimeout((function(_) {
    return document.body.scrollTop = document.body.scrollHeight;
  }), 0);
}


},{"./input-logic":1,"./output-logic":3,"./tools/html-renderer":7,"./tools/simple-stream":8}],3:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Stream = require('./tools/simple-stream').default;
var StreamLogger = require('./tools/stream-logger').default;
var AnsiParser = require('./tools/ansi-parser').default;
var socket = require('./socket').default;
var output = new Stream();
var stdout = Stream.fromEvent(socket, 'stdout');
var stderr = Stream.fromEvent(socket, 'stderr');
stderr.pipe(new AnsiParser()).pipe(new StreamLogger('[STDERR]')).pipe(output);
stdout.pipe(new AnsiParser()).pipe(new StreamLogger('[STDOUT]')).pipe(output);
socket.on('close', (function(code) {
  stdout.end();
  stderr.end();
  console.log('[EXIT]', code);
}));
var $__default = output;


},{"./socket":4,"./tools/ansi-parser":5,"./tools/simple-stream":8,"./tools/stream-logger":9}],4:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var socket = io.connect();
var $__default = socket;


},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Stream = require('./simple-stream').default;
function flatten(array) {
  return Array.prototype.concat.apply([], array);
}
var ESC = '\x1b';
var defaultStyles = {
  fg: 'default',
  bg: 'default',
  underline: false,
  inverse: false,
  italics: false,
  strike: false,
  bold: false
};
var styleCodes = {
  0: defaultStyles,
  1: {bold: true},
  2: {bold: false},
  3: {italics: true},
  4: {underline: true},
  7: {inverse: true},
  9: {strike: true},
  22: {bold: false},
  23: {italics: false},
  24: {underline: false},
  27: {inverse: false},
  29: {strike: false},
  30: {fg: 'black'},
  31: {fg: 'red'},
  32: {fg: 'green'},
  33: {fg: 'yellow'},
  34: {fg: 'blue'},
  35: {fg: 'magenta'},
  36: {fg: 'cyan'},
  37: {fg: 'white'},
  39: {fg: defaultStyles.fg},
  40: {bg: 'black'},
  41: {bg: 'red'},
  42: {bg: 'green'},
  43: {bg: 'yellow'},
  44: {bg: 'blue'},
  45: {bg: 'magenta'},
  46: {bg: 'cyan'},
  47: {bg: 'white'},
  49: {bg: defaultStyles.bg}
};
var AnsiParser = function AnsiParser() {
  $traceurRuntime.superCall(this, $AnsiParser.prototype, "constructor", []);
  this._styles = Object.assign({}, defaultStyles);
  this._code = [];
  this._escFound = false;
  this._lastChar = null;
};
var $AnsiParser = AnsiParser;
($traceurRuntime.createClass)(AnsiParser, {
  write: function(data) {
    var output = data.split('').map(this._parseChar, this).filter(Boolean);
    flatten(output).forEach(this._write, this);
  },
  _parseChar: function(character) {
    var code = this._code;
    if (character === ESC) {
      code.push(ESC);
      return;
    }
    if (code.length) {
      if (code.length === 1 && character !== '[')
        return [code.pop(), character];
      code.push(character);
      if (character !== 'm')
        return;
      this._styles = this.parseColor(this._styles, code);
      code.length = 0;
      return Object.assign({}, this._styles);
    }
    return character;
  },
  parseColor: function(current, chars) {
    if (chars.length === 3)
      return {};
    var styles = chars.join('').slice(2, -1).split(';').map((function(code) {
      if (!styleCodes.hasOwnProperty(code))
        return console.error('Unknown code', code, 'at', chars);
      return styleCodes[code];
    })).filter(Boolean).reduce((function(result, style) {
      return Object.assign(result, style);
    }), {});
    Object.keys(styles).forEach((function(key) {
      if (styles[key] === defaultStyles[key])
        delete styles[key];
    }));
    return styles;
  }
}, {}, Stream);
var $__default = AnsiParser;


},{"./simple-stream":8}],6:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
function equals(handler, scope, expected) {
  return function(item) {
    return (item.funct === handler && item.scope === scope) === expected;
  };
}
function hasListener(listeners, signal, handler, scope) {
  if (!listeners[signal])
    return false;
  return listeners[signal].some(equals(handler, scope, true));
}
var Emitter = function Emitter() {
  this._listeners = {};
};
($traceurRuntime.createClass)(Emitter, {
  dispose: function() {
    this._listeners = null;
  },
  listenersCount: function(signal) {
    var list = this._listeners[signal];
    return list ? list.length : 0;
  },
  on: function(signal, handler, scope) {
    var list = this._listeners;
    if (hasListener(list, signal, handler, scope))
      return;
    if (!list[signal])
      list[signal] = [];
    list[signal].push({
      funct: handler,
      scope: scope
    });
  },
  off: function(signal, handler, scope) {
    var list = this._listeners[signal];
    if (!list)
      return;
    this._listeners[signal] = list.filter(equals(handler, scope, false));
  },
  once: function(signal, handler, scope) {
    var $__0 = arguments,
        $__1 = this;
    if (hasListener(this._listeners, signal, handler, scope))
      return;
    this.on(signal, (function() {
      $__1.off(signal, wrapper, $__1);
      handler.apply(scope, $__0);
    }), this);
  },
  emit: function(signal) {
    var list = this._listeners[signal];
    if (!list)
      return;
    var data = Array.prototype.slice.call(arguments, 1);
    list.forEach((function(item) {
      return item.funct.apply(item.scope, data);
    }));
  }
}, {});
var $__default = Emitter;


},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var BACKSPACE = '\x08';
var escapes = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  '\'': '&#039;'
};
function escapeHtml(character) {
  return escapes.hasOwnProperty(character) ? escapes[character] : character;
}
var HtmlRenderer = function HtmlRenderer() {};
($traceurRuntime.createClass)(HtmlRenderer, {
  fromAnsiStream: function(dom, stream) {
    var $__0 = this;
    var styles = {};
    var div = document.createElement('div');
    var span = document.createElement('span');
    div.appendChild(span);
    dom.appendChild(div);
    stream.on('data', (function(data) {
      if (data === '\n') {
        div = document.createElement('div');
        dom.appendChild(div);
        data = styles;
      }
      if (typeof data !== 'string') {
        span = document.createElement('span');
        span.className = $__0.stylesToClasses(data).join(' ');
        div.appendChild(span);
        styles = data;
        return;
      }
      if (data === BACKSPACE)
        return span.innerHTML = span.innerHTML.slice(0, -1);
      span.innerHTML += escapeHtml(data);
    }));
  },
  fromLinesStream: function(dom, stream) {
    var $__0 = this;
    stream.on('data', (function(line) {
      var div = document.createElement('div');
      dom.appendChild(div);
      line.on('data', (function(block) {
        var span = document.createElement('span');
        div.appendChild(span);
        block.on('data', (function(data) {
          if (typeof data === 'string')
            span.innerHTML += escapeHtml(data);
          else
            span.className = $__0.stylesToClasses(data).join(' ');
        }));
      }));
    }));
  },
  stylesToClasses: function(styles) {
    return Object.keys(styles).map((function(key) {
      var value = styles[key];
      var appendix = value === true ? '' : '-' + value;
      return 'ansi-' + key + appendix;
    }));
  }
}, {});
var $__default = HtmlRenderer;


},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Emitter = require('./emitter').default;
var SimpleStream = function SimpleStream() {
  $traceurRuntime.superCall(this, $SimpleStream.prototype, "constructor", []);
  this._closed = false;
};
var $SimpleStream = SimpleStream;
($traceurRuntime.createClass)(SimpleStream, {
  _write: function(data) {
    if (this._closed)
      throw new Error('Stream has ended');
    this.emit('data', data);
  },
  write: function(data) {
    this._write(data);
  },
  end: function() {
    this._closed = true;
    this.emit('end');
    this.dispose();
  },
  pipe: function(target) {
    this.on('data', (function(data) {
      return target.write(data);
    }));
    this.on('end', (function() {
      return target.end();
    }));
    return target;
  }
}, {
  fromEvent: function(object, event) {
    var $__3;
    var $__2 = $traceurRuntime.assertObject(arguments[2] !== (void 0) ? arguments[2] : {}),
        method = ($__3 = $__2.method) === void 0 ? 'on' : $__3;
    var stream = new $SimpleStream();
    object[method](event, stream.write.bind(stream));
    return stream;
  },
  fromDomEvent: function(object, event) {
    return $SimpleStream.fromEvent(object, event, {method: 'addEventListener'});
  }
}, Emitter);
var $__default = SimpleStream;


},{"./emitter":6}],9:[function(require,module,exports){
"use strict";
Object.defineProperties(exports, {
  default: {get: function() {
      return $__default;
    }},
  __esModule: {value: true}
});
var Stream = require('./simple-stream').default;
var StreamLogger = function StreamLogger(id) {
  $traceurRuntime.superCall(this, $StreamLogger.prototype, "constructor", []);
  this._id = id;
};
var $StreamLogger = StreamLogger;
($traceurRuntime.createClass)(StreamLogger, {write: function(data) {
    if (typeof data === 'string')
      console.log(this._id, data.charCodeAt(0), data);
    else
      console.log(this._id, data);
    this._write(data);
  }}, {}, Stream);
var $__default = StreamLogger;


},{"./simple-stream":8}]},{},[2])