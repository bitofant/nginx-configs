import props from './application-properties';
import fs = require ('fs');
import express = require ('express');
// import basicAuth = require ('express-basic-auth');
import { io, server, app } from './modules/globals';
import bus from './modules/event-bus';

import { Logger, express as logger_express } from './modules/helper/logger';
import { Connection } from './modules/session/connection';
const log = Logger(module);

import './modules/index-html';
import { config } from './modules/config';



server.listen (props.port, () => {
	var port = props.port;
	var addr = server.address ();
	if (typeof (addr) !== 'string') port = addr.port;
	log ('App listening on port ' + port, 'red');
});

app.disable ('x-powered-by')

app.use (express.static (__dirname + '/htdocs'));
app.use ('/log/', logger_express);


bus.on ('config', () => {
	io.emit ('config', config);
});


// import nodeSSH = require ('node-ssh');
// const ssh = new nodeSSH ();

// app.get ('/test', (req, res) => {
// 	log (req.url);
// 	ssh.connect ({
// 		host: config.server,
// 		username: config.user,
// 		privateKey: '/Users/' + getOneOfTheseEnvironmentVariables ('SUDO_USER', 'LOGNAME', 'USER', 'LNAME', 'USERNAME') + '/.ssh/id_rsa'
// 	}).then (() => {
// 		ssh.execCommand ('ls -al', { cwd: '~/' }).then (result => {
// 			console.log ('STDOUT: ' + result.stdout);
// 			console.log ('STDERR: ' + result.stderr);
// 		});
// 	});
// });


var reloadUntil = Date.now () + 5000;

if (props.env.dev) {
	fs.watchFile (__dirname + '/htdocs/bundle.js', () => {
		io.emit ('refresh');
	});
}

io.on ('connection', socket => {
	new Connection (socket);
});

process.on ('uncaughtException', err => {
	console.log ('### UNCAUGHT EXCEPTION ###');
	log ('### UNCAUGHT EXCEPTION ###');
	log (err.stack);
});



function logRamUsage () {
	log (Math.round (process.memoryUsage ().rss / 1024 / 1024) + 'mb memory usage', 'blue');
}
setInterval (logRamUsage, 60000);
setTimeout (logRamUsage, 13000);
