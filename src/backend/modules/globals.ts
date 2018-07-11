import props from '../application-properties';

import express = require ('express');
const app = express ();

import compression = require ('compression');
app.use (compression ({
	level: 9
}));

import http = require ('http');
const server = http.createServer (app);

import socketIO = require ('socket.io');

interface ioV2serverOptions extends socketIO.ServerOptions {
	upgradeTimeout?: number;
}

let ioArgs : ioV2serverOptions = (!props.aggressiveTimeouts) ? {} : {
	pingTimeout: 10000,
	pingInterval: 5000,
	upgradeTimeout: 5000
};


const io : socketIO.Server = socketIO.call (socketIO, server, ioArgs);


export {
	io,
	server,
	app
};
export default {
	io,
	server,
	app
};
