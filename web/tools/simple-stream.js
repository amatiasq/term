import Emitter from './emitter';

export default class SimpleStream extends Emitter {

  static fromEvent(object, event, { method: method = 'on' } = {}) {
    var stream = new SimpleStream();
    object[method](event, stream.write.bind(stream));
    return stream;
  }

  static fromDomEvent(object, event) {
    return SimpleStream.fromEvent(object, event, {
      method: 'addEventListener'
    });
  }

  constructor() {
    super.constructor();
    this._closed = false;
  }

  _write(data) {
    if (this._closed)
      throw new Error('Stream has ended');

    this.emit('data', data);
  }

  write(data) {
    this._write(data);
  }

  end() {
    this._closed = true;
    this.emit('end');
    this.dispose();
  }

  pipe(target) {
    this.on('data', data => target.write(data));
    this.on('end', () => target.end());
    return target;
  }
}
