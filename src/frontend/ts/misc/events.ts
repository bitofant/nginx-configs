class EventEmitter {
	private listeners : { [event: string]: Array<(...args:any[])=>void> } = {};

	constructor () {
	}

	public on (event: string, listener: (...args:any[]) => void) {
		var ev = this.listeners[event];
		if (ev) ev.push (listener);
		else this.listeners[event] = [listener];
	}

	// public addListener (event: string, listener: (...args:any[])=>void) {
	// 	this.on (event, listener);
	// }

	public removeListener (event: string, listener: (...args:any[])=>void) {
		var ev = this.listeners[event];
		if (!ev) return false;
		for (var i = 0; i < ev.length; i++) {
			if (ev[i] === listener) {
				ev.splice (i, 1);
				return true;
			}
		}
		return false;
	}

	public emit (event: string, ...args: any[]) {
		var ev = this.listeners[event];
		if (!ev) return;
		for (var i = 0; i < ev.length; i++) {
			ev[i] (args[0]);
		}
	}

}


export { EventEmitter };
export default EventEmitter;
