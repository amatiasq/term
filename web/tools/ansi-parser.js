import Stream from './simple-stream';

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

export default class AnsiParser extends Stream {

  constructor() {
    super.constructor();
    this._styles = Object.assign({}, defaultStyles);
    this._code = [];
    this._escFound = false;
    this._lastChar = null;
  }

  write(data) {
    var output = data.split('')
      .map(this._parseChar, this)
      .filter(Boolean)

    flatten(output)
      .forEach(this._write, this);
  }

  _parseChar(character) {
    var code = this._code;
    //console.log(character, code);

    if (character === ESC) {
      code.push(ESC);
      return;
    }

    if (code.length) {
      if (code.length === 1 && character !== '[')
        return [ code.pop(), character ];

      code.push(character);
      if (character !== 'm')
        return;

      this._styles = this.parseColor(this._styles, code);
      code.length = 0;
      return Object.assign({}, this._styles);
    }

    return character;
  }

  parseColor(current, chars) {
    if (chars.length === 3)
      return {};

    var styles = chars
      .join('')
      .slice(2, -1)
      .split(';')
      .map(code => {
        if (!styleCodes.hasOwnProperty(code))
          return console.error('Unknown code', code, 'at', chars);
        return styleCodes[code];
      })
      .filter(Boolean)
      .reduce((result, style) => Object.assign(result, style), {})

    Object.keys(styles).forEach(key => {
      if (styles[key] === defaultStyles[key])
        delete styles[key];
    });

    return styles;
  }
}
