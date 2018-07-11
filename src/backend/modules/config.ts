import fs = require ('fs');
import props from '../application-properties';
import bus from './event-bus';
import Logger from './helper/logger';
const log = Logger (module);

interface DomainConfig {
	tld: string,
	subdomains: Array<string>,
	upstream: { [subdomain: string]: number }
}

interface SSLZone {
	name: string,
	certFullChain: string,
	certPrivateKey: string,
	domainConfigs: Array<DomainConfig>,
	includePHP: boolean,
	path: string,
	subdomainPath: string
}

interface ServerConfig {
	server: string,
	user: string,
	password: string,
	sslZones: Array<SSLZone>
}

const config : ServerConfig = {
	server: '',
	user: '',
	password: '',
	sslZones: []
};

if (fs.existsSync (props.storageFile)) {
	var conf = JSON.parse (fs.readFileSync (props.storageFile, 'utf8'));
	if (conf.server && conf.password && conf.user && conf.sslZones) {
		config.server = conf.server;
		config.user = conf.user;
		config.password = conf.password;
		config.sslZones = conf.sslZones;
		log ('Config <' + config.server + '> loaded');
	}
}

function SaveConfig (listener? : () => void) : void {
	fs.writeFile (props.storageFile, JSON.stringify (config, null, '\t'), 'utf8', err => {
		if (err) throw err;
		if (listener) listener ();
		bus.emit ('config');
	});
}

export { config, DomainConfig, SSLZone, ServerConfig, SaveConfig };
export default config;
