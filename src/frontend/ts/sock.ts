import { Socket } from "socket.io";

declare var io : any;

function CreateSocket () {
	if (typeof (io) !== 'undefined') {
		return io (location.href);
	}
	return { connected: false };
}

const sock : Socket = CreateSocket ();

export { sock };
export default sock;



window.addEventListener ('error', (ev) => {
	sock.emit ('frontend:error', {
		message: ev.message,
		source:  ev.filename,
		lineno:  ev.lineno,
		colno:   ev.colno,
		error:   ev.error === null ? null : {
			stack: ev.error.stack,
			msg: ev.error.message
		},
		timestamp: ev.timeStamp
	});
}, false);
