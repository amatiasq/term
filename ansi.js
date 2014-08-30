/*globals console */
'use strict';

//
// HELPERS
//

function extend(target) {
  Array.prototype.slice.call(arguments, 1).forEach(function(source) {
    Object.keys(source).forEach(function(key) {
      target[key] = source[key];
    });
  });
  return target;
}


//
// ANSI PARSING
//

var defaultStyles = {
  fg: 'default',
  bg: 'default',
  underline: false,
  inverse: false,
  italics: false,
  strike: false,
  bold: false,
};
var styleCodes = {
  0:  defaultStyles,
  1:  { bold: true },
  2:  { bold: false }, // non standard
  3:  { italics: true },
  4:  { underline: true },
  7:  { inverse: true },
  9:  { strike: true },
  22: { bold: false },
  23: { italics: false },
  24: { underline: false },
  27: { inverse: false },
  29: { strike: false },
  30: { fg: 'black' },
  31: { fg: 'red' },
  32: { fg: 'green' },
  33: { fg: 'yellow' },
  34: { fg: 'blue' },
  35: { fg: 'magenta' },
  36: { fg: 'cyan' },
  37: { fg: 'white' },
  39: { fg: defaultStyles.fg },
  40: { bg: 'black' },
  41: { bg: 'red' },
  42: { bg: 'green' },
  43: { bg: 'yellow' },
  44: { bg: 'blue' },
  45: { bg: 'magenta' },
  46: { bg: 'cyan' },
  47: { bg: 'white' },
  49: { bg: defaultStyles.bg },
};


function AnsiParser() {
  this.styles = extend({}, defaultStyles);
  this.code = [];
  this.lastChar = null;
}

AnsiParser.prototype.parse = function(ansi) {
  var buffer = Array.prototype.map.call(ansi, this.parseChar, this);
  return buffer.filter(Boolean);
};

AnsiParser.prototype.parseChar = function(character) {
  var prev = this.lastChar;
  this.lastChar = character;

  if (character === '\x1b')
    return;

  if (character === '[' && prev === '\x1b') {
    this.code.push(prev, character);
    return;
  }

  if (this.code.length) {
    if (character === 'K') {
      this.code.length = 0;
      return;
    }

    this.code.push(character);
    if (character !== 'm')
      return;

    var color = parseColor(this.styles, this.code);
    this.code.length = 0;
    return color;
  }

  return character;
};

function parseColor(currentStyles, chars) {
  if (chars.length === 3)
    return applyState(currentStyles, defaultStyles);

  return chars
    .join('')
    .slice(2, -1)
    .split(';')
    .map(function(code) {
      if (!styleCodes.hasOwnProperty(code)) {
        debugger;
        return console.error('Unkown code', code, 'at', chars);
      }
      return applyState(currentStyles, styleCodes[code]);
    })
    .filter(Boolean)
    .reduce(function(summary, item) {
      return extend(summary, item);
    }, {});
}
function applyState(currentStyles, newStyles) {
  var result = {};
  var modified = false;

  Object.keys(newStyles).filter(function(key) {
    return newStyles[key] !== currentStyles[key];
  }).forEach(function(key) {
    result[key] = currentStyles[key] = newStyles[key];
    modified = true;
  });

  return modified ? result : null;
}


//
// HTML RENDERING
//

var escapes = {
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '"': '&quot;',
  '\'': '&#039;',
};


AnsiParser.prototype.renderHtml = function(code) {
  code = accumulative(code);
  var lastTag = '';

  var html = code.map(function(character) {
    if (character === '\n')
      return closeSpans(character.open) + ' </div><div>' + lastTag;

    if (typeof character === 'string')
      return escapeHtml(character);

    var classes = [];
    Object.keys(character).forEach(function(key) {
      if (key === 'closePrev' || key === 'open') return;
      var value = character[key];
      classes.push('ansi-' + key + (value === true ? '' : '-' + value));
    });

    var tag = classes.length ? '<span class="' + classes.join(' ') + '">' : '';
    lastTag = tag;
    return closeSpans(character.closePrev) + tag;
  });

  return html.join('');
};


function escapeHtml(character) {
  return escapes.hasOwnProperty(character) ? escapes[character] : character;
}

function closeSpans(count) {
  var closing = '';
  for (; count > 0; count--)
    closing += '</span>';
  return closing;
}

function accumulative(code) {
  var accumulated = {};

  return code.map(function(character) {
    if (typeof character === 'string')
      return character;

    var changes = extend({}, accumulated, character);
    Object.keys(changes).forEach(function(key) {
      if (changes[key] === defaultStyles[key])
        delete changes[key];
    });

    if (accumulated.open) {
      changes.closePrev = accumulated.open;
    }

    accumulated = changes;
    accumulated.open = 1;
    return changes;
  });
}
