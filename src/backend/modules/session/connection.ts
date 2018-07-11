import Logger from '../helper/logger';
const log = Logger(module);
const logFrontendError = Logger ('frontend', 'red');
import props from '../../application-properties';
import { config, SaveConfig, SSLZone, DomainConfig } from '../config';
import { io } from '../globals';
import { ScriptGenerator } from './script-generator';
import { executeScript } from './script-executor';



class Connection {

	constructor (sock) {

		sock.on ('frontend:error', (ev : {
			message,
			source,
			lineno,
			colno,
			error,
			timestamp
		}) => {
			logFrontendError (ev.source + ':' + ev.lineno + ' | ' + ev.message);
			console.log (ev);
		});
		
		sock.on ('auth', auth => {
			log ('auth!' + JSON.stringify (auth));
		});

		sock.on ('config:credentials', (credentials : { server: string, user: string, password: string }) => {
			config.server = credentials.server;
			config.user = credentials.user;
			config.password = credentials.password;
			SaveConfig (() => {
				io.emit ('config:credentials', credentials);
			});
		});

		sock.on ('zone:add', (zone : SSLZone) => {
			var newZone = Object.assign ({
				name: zone.name,
				certFullChain: '/root/.acme.sh/' + zone.name + '/fullchain.cer',
				certPrivateKey: '/root/.acme.sh/' + zone.name + '/' + zone.name + '.key',
				domainConfigs: [],
				includePHP: true,
				path: '/var/www/html/',
				subdomainPath: '/var/www/html/_subdomains/'
			}, zone);
			config.sslZones.push (newZone);
			SaveConfig (() => {
				io.emit ('zone:added', newZone);
			});
		});

		sock.on ('zone:remove', (zone : SSLZone) => {
			var zoneId = config.sslZones.findIndex (z => z.name === zone.name);
			if (zoneId < 0) {
				log ('Zone not found!', 'red');
			} else {
				config.sslZones.splice (zoneId, 1);
				SaveConfig (() => {
					io.emit ('zone:removed', zone);
				});
			}
		});

		sock.on ('zone:update', (changes: { oldName: string, zone: SSLZone}) => {
			var zoneId = config.sslZones.findIndex (z => z.name === changes.oldName);
			if (zoneId < 0) {
				log ('Zone not found!', 'red');
			} else {
				var zone = config.sslZones[zoneId];
				for (var k in changes.zone) {
					if (k === 'domainConfigs') continue;
					zone[k] = changes.zone[k];
				}
				SaveConfig (() => {
					io.emit ('zone:updated', changes);
				});
			}
		});

		sock.on ('zone:domains', (domainSettings : { zone: string, domainConfigs: Array<DomainConfig> }) => {
			var zone = config.sslZones.find (zone => zone.name === domainSettings.zone);
			if (!zone) throw Error ('Unable to find zone!');
			zone.domainConfigs = domainSettings.domainConfigs;
			SaveConfig (() => {
				io.emit ('zone:domains', domainSettings);
			});
		});


		sock.on ('script:generate', () => {
			ScriptGenerator.generate ((script : string) => {
				io.emit ('script:generated', script);
			});
		});

		sock.on ('script:execute', () => {
			ScriptGenerator.generate ((script : string) => {
				executeScript (config.server, config.user, script, (stdout : string, stderr : string) => {
					log ('done; ' + JSON.stringify ({ stdout, stderr }, null, 4));
					sock.emit ('script:executed', { stdout, stderr });
				});
			});
		});

	}
}


export { Connection };
export default Connection;
