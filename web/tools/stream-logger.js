import Stream from './simple-stream';

export default class StreamLogger extends Stream {

	constructor(id) {
		super.constructor();
		this._id = id;
	}

	write(data) {
		if (typeof data === 'string')
			console.log(this._id, data.charCodeAt(0), data);
		else
			console.log(this._id, data);

		this._write(data);
	}
}
