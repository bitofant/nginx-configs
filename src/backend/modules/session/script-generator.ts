import { Logger } from "../helper/logger";
import { config, SSLZone } from "../config";
import { createNginxUpstreamConfig } from "./scripts/upstream";
import { createNginxConfig } from "./scripts/nginx";
const log = Logger (module);

function twoDigits (n : number) : string {
	return (n < 10 ? '0' : '') + n;
}

function timeAndDate () : string {
	var d = new Date ();
	return [
		d.getFullYear (),
		twoDigits (d.getMonth () + 1),
		twoDigits (d.getDate ()),
		twoDigits (d.getHours ()),
		twoDigits (d.getMinutes ()),
		twoDigits (d.getSeconds ())
	].join ('');
}

function printScript (script : string) : string {
	return 'printf "' + script.trim ().split ('$').join ('\\$').split ('\n').join ('\\n').split ('\t').join ('\\t') + '\\n"';
}

const DEFAULT_SERVER = `
server {
	listen 80 default_server;
	server_name localhost;
	include /etc/nginx/default.d/*.conf;
}
`;

namespace ScriptGenerator {

	export function generate (callback : (script : string) => void) : void {
		log ('generating script...');

		var scr = '#!/bin/bash\n# Config for ' + config.user + ' @ ' + config.server + '\n\n';

		var home = config.user === 'root' ? '/root' : ('/home/' + config.user);
		var now = timeAndDate ();

		scr += 'echo creating backup\n';
		scr += 'if [ ! -d "' + home + '/backup" ]; then\n'
		scr += '  mkdir ' + home + '/backup\n';
		scr += 'fi\n';
		scr += 'mkdir ' + home + '/backup/' + now + '\n';
		scr += 'mkdir ' + home + '/backup/' + now + '/nginx\n';
		scr += 'cp /etc/nginx/conf.d/* ' + home + '/backup/' + now + '/nginx/\n';

		scr += '\necho removing current config\n';
		scr += 'rm -f /etc/nginx/conf.d/*.conf\n';
		scr += 'for f in /etc/nginx/conf.d/*.preserve; do\n';
		scr += '	cp "$f" "/etc/nginx/conf.d/$(basename "$f" .preserve).conf"\n';
		scr += 'done\n';

		scr += '\necho generating new config\n';
		scr += printScript (DEFAULT_SERVER) + ' > /etc/nginx/conf.d/default.conf\n';
		config.sslZones.forEach (zone => {
			scr += printScript (createNginxConfig (zone)) + ' > /etc/nginx/conf.d/' + zone.name + '.conf\n';
			zone.domainConfigs.forEach (domain => {
				for (var k in domain.upstream) {
					scr += printScript (createNginxUpstreamConfig (zone, domain.tld, k, domain.upstream[k])) + ' > /etc/nginx/conf.d/' + k + '.' + domain.tld + '.conf\n';
				}
			});
		});

		scr += '\necho restarting services\n';
		scr += 'systemctl stop nginx.service\n';

		scr += '\necho "done;"\n';

		callback (scr);
	}

}

export { ScriptGenerator };
export default ScriptGenerator;
