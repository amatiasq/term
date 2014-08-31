import Stream from './simple-stream';

export default class LinesTransformer extends Stream {

  constructor() {
    super.constructor();
    this._lastLine = null;
    this._newLine();
  }

  write(data) {
    if (data === '\n')
      this._newLine();
    else
      this._lastLine.write(data);
  }

  _newLine() {
    if (this._lastLine)
      this._lastLine.end();

    var newLine = new LineStream();
    this._lastLine = newLine;
    this._write(newLine);
  }
}

class LineStream extends Stream {

  constructor() {
    super.constructor();
    this._lastBlock = null;
    this._newBlock({});
  }

  write(data) {
    if (typeof data === 'string')
      this._lastBlock.write(data);
    else
      this._newBlock(data);
  }

  _newBlock(data) {
    if (this._lastBlock)
      this._lastBlock.end();

    var newBlock = new StyleBlockStream();
    this._lastBlock = newBlock;
    this._write(newBlock);
    newBlock.write(data);
  }
}

class StyleBlockStream extends Stream { }
