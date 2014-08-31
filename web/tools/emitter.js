function equals(handler, scope, expected) {
	return function(item) {
		return (
			item.funct === handler &&
			item.scope === scope
		) === expected;
	};
}

function hasListener(listeners, signal, handler, scope) {
	if (!listeners[signal])
		return false;

	return listeners[signal].some(equals(handler, scope, true))
}


export default class Emitter {

	/**
	 * Creates an object with methods to add callbacks (listeners)
	 *   to specific signals and invoke this callbacks.
	 */
	constructor() {
		this._listeners = {};
	}

  dispose() {
    this._listeners = null;
  }

	/**
	 * Returns the count of listeners for a specific signal.
	 *
	 * @param signal <String> The signal we want to count listeners from.
	 * @returns <Number> The count.
	 */
	listenersCount(signal) {
    var list = this._listeners[signal];
    return  list ? list.length : 0;
	}

	/**
	 * Adds a listener to a signal, optionally a scope can be provided.
	 * NOTE: Calling this method with the same arguments will NOT add a new listener.
	 *
	 * @param signal <String> The signal to listen.
	 * @param handler <Function> The callback function.
	 * @param scope <Object?> The scope for the callback.
	 */
	on(signal, handler, scope) {
		var list = this._listeners;

		if (hasListener(list, signal, handler, scope))
			return;

		if (!list[signal])
			list[signal] = [];

		list[signal].push({
			funct: handler,
			scope: scope
		});
	}

	/**
	 * Removes the listener added with exactly the same arguments.
	 *
	 * @param signal <String> The signal from we want to remove the listener.
	 * @param handler <Function> The callback passed to .on() method.
	 * @param scope <Object> The scope for the callback.
	 */
	off(signal, handler, scope) {
		var list = this._listeners[signal];
		if (!list)
			return;

		this._listeners[signal] = list.filter(equals(handler, scope, false));
	}

	/**
	 * Adds a listener to be fired only the next time the signal is emitted.
	 *
	 * @param signal <String> The signal to listen.
	 * @param handler <Function> The callback function.
	 * @param scope <Object?> The scope for the callback.
	 */
	once(signal, handler, scope) {
		if (hasListener(this._listeners, signal, handler, scope))
			return;

		this.on(signal, () => {
			this.off(signal, wrapper, this);
			handler.apply(scope, arguments);
		}, this);
	}

	/**
	 * Executes the callbacks for the given signal.
	 * Any extra argument will be passed to the callback.
	 *
	 * @param signal <String> The signal of the listeners we want to invoke.
	 * @param var_args <object...> Any arguments we want the callbacks to recive.
	 */
	emit(signal/*, var_args*/) {
		var list = this._listeners[signal];
		if (!list)
			return;

		var data = Array.prototype.slice.call(arguments, 1);
		list.forEach(item => item.funct.apply(item.scope, data));
	}
}
