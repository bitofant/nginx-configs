import fs = require ('fs');
import props from '../application-properties';
import bus from '../modules/event-bus';
import Logger from '../modules/helper/logger';
const log = Logger (module);
import { config } from './config';

var path = {
	src: __dirname + '/..' + (props.env.dev ? '/../src/frontend/index.html' : '/htdocs/index.html'),
	dst: __dirname + '/..' + '/htdocs/index.html',
};

function updateFile () {
	var t1 = Date.now ();
	fs.readFile (path.src, 'utf8', (err, content) => {
		if (err) return log (err.stack, 'red');

		var replace = {
			EXECUTION_PROFILE: props.env.name,
			SERVER_CONFIG: config
		};

		var variables = [];
		for (var k in replace) {
			variables.push (k + ' = ' + JSON.stringify (replace[k]));
		}
		content = content.replace (
			/<script ([^<>]*)src="replace:\/\/backend-vars">([^<]*)<\/script>/,
			(match, additionalProps : string, additionalContent : string) => {
				var props = additionalProps.trim ();
				if (props.length > 0) props = ' ' + props;
				var addCon = additionalContent.trim ();
				if (addCon.length > 0) addCon = ';\n\t' + addCon;
				return '<script' + props + '>\n\t' + variables.join (';\n\t') + addCon + '\n</script>';
			});
		fs.writeFile (path.dst, content, 'utf8', err => {
			if (err) return log (err.stack, 'red');
			log ('index.html updated in ' + (Date.now () - t1) + 'ms', 'magenta');
		});
	});
}

bus.on ('config', updateFile);
updateFile ();
if (props.env.dev) {
	fs.watchFile (path.src, updateFile);
}

