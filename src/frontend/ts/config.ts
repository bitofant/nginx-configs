import sock from "./sock";
import { bus, SnackbarMessage } from './bus';

interface DomainConfig {
	tld: string,
	subdomains: Array<string>,
	upstream: { [subdomain: string]: { addr: string, port: number } }
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

declare var SERVER_CONFIG : ServerConfig;

const config = SERVER_CONFIG;


function snackbar (html : string) {
	var msg : SnackbarMessage = {
		html
	};
	bus.emit ('snackbar', msg);
}


sock.on ('config:credentials', (credentials : { server: string, user: string, password: string }) => {
	config.server = credentials.server;
	config.user = credentials.user;
	config.password = credentials.password;
	snackbar ('Credentials updated for ' + credentials.server);
});

sock.on ('zone:added', (zone : SSLZone) => {
	config.sslZones.push (zone);
	snackbar ('SSL zone <b>' + zone.name + '</b> added');
});

sock.on ('zone:removed', (zone : SSLZone) => {
	var zoneId = config.sslZones.findIndex (z => z.name === zone.name);
	if (zoneId < 0) {
		console.error ('Zone not found!');
	} else {
		config.sslZones.splice (zoneId, 1);
		snackbar ('SSL zone <b>' + zone.name + '</b> removed');
	}
});

sock.on ('zone:updated', (changes: { oldName: string, zone: SSLZone}) => {
	var zoneId = config.sslZones.findIndex (z => z.name === changes.oldName);
	if (zoneId < 0) {
		console.error ('Zone not found!');
	} else {
		var zone = config.sslZones[zoneId];
		for (var k in changes.zone) {
			if (k === 'domainConfigs') continue;
			zone[k] = changes.zone[k];
		}
		snackbar ('SSL zone <b>' + zone.name + '</b> updated');
	}
});

sock.on ('zone:domains', (domainSettings : { zone: string, domainConfigs: Array<DomainConfig> }) => {
	var zone = config.sslZones.find (zone => zone.name === domainSettings.zone);
	if (!zone) throw Error ('Unable to find zone!');
	zone.domainConfigs.splice (0, zone.domainConfigs.length);
	domainSettings.domainConfigs.forEach (cfg => zone.domainConfigs.push (cfg));
	snackbar ('Domain config changed for <b>' + domainSettings.zone + '</b>');
});


// socket.on ('config', (newConfig : ServerConfig) => {
// 	// on config update: iteratec through everything and update values rather than replacing object references (due to vues reactive behavior)
// 	if (JSON.stringify (newConfig) === JSON.stringify (config)) return;
// 	for (var k in config) {
// 		if (k === 'sslZones') continue;
// 		if (config[k] !== newConfig[k]) {
// 			config[k] = newConfig[k];
// 		}
// 	}c
// 	config.sslZones.forEach ((zone, i) => {
// 		const newZone = newConfig.sslZones[i];
// 		for (var k in zone) {
// 			if (k === 'domainConfigs') continue;
// 			if (zone[k] !== newZone[k]) {
// 				zone[k] = newZone[k];
// 			}
// 		}
// 		zone.domainConfigs.forEach ((domain, j) => {
// 			const newDomain = newZone.domainConfigs[j];
// 			for (var k in domain) {
// 				if (JSON.stringify (domain[k]) !== JSON.stringify (newDomain[k])) {
// 					domain[k] = newDomain[k];
// 				}
// 			}
// 		});
// 	});
// });


export { config, DomainConfig, SSLZone, ServerConfig };
export default config;
