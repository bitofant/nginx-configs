import EventEmitter from './misc/events';

const bus = new EventEmitter ();

interface SnackbarMessage {
	text?: string,
	html?: string,
	timeout?: number
}

export { bus, SnackbarMessage };
export default bus;
