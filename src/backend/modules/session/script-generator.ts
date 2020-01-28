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

// function fixIndentation (str : string, indentation : string) : string {
// 	return str.split('\n')
// 		.map(line => line.startsWith(indentation) ? line.substr(indentation.length) : line)
// 		.join('\n');
// }

function printScript (script : string, file : string) : string {
	// return 'printf "' + script.trim ().split ('$').join ('\\$').split ('\n').join ('\\n').split ('\t').join ('\\t') + '\\n"';
	return [ `cat > ${file} << EOF`, script, 'EOF' ].join('\n');
}

const DEFAULT_SERVER = `server {
	listen 80 default_server;
	server_name localhost;
	include /etc/nginx/default.d/*.conf;
}`;

namespace ScriptGenerator {

	export function generate (callback : (script : string) => void) : void {
		log ('generating script...');

		var home = config.user === 'root' ? '/root' : ('/home/' + config.user);
		var now = timeAndDate ();
		
		var scr = `#!/bin/bash
# Config for ${config.user} @ ${config.server}

echo "creating backup"
if [ ! -d "${home}/backup" ]; then
	mkdir ${home}/backup
fi
mkdir ${home}/backup/${now}
mkdir ${home}/backup/${now}/nginx
cp /etc/nginx/conf.d/* ${home}/backup/${now}/nginx/

echo "removing current config"
rm -f /etc/nginx/conf.d/*.conf
for f in /etc/nginx/conf.d/*.preserve; do
	cp "$f" "/etc/nginx/conf.d/$(basename "$f" .preserve).conf
done

echo "generating new config"
${printScript (DEFAULT_SERVER, '/etc/nginx/conf.d/default.conf')}
${(function () {
	const lines = [];
	config.sslZones.forEach (zone => {
		lines.push (printScript (createNginxConfig (zone), `/etc/nginx/conf.d/${zone.name}.conf`));
		zone.domainConfigs.forEach (domain => {
			for (var k in domain.upstream) {
				lines.push (printScript (createNginxUpstreamConfig (zone, domain.tld, k, domain.upstream[k]), `/etc/nginx/conf.d/${k}.${domain.tld}.conf`));
			}
		});
	});
	return lines.join('\n');
}) ()}

echo "restarting services"
systemctl stop nginx.service

echo "done;"`;

		callback (scr);
	}

}

export { ScriptGenerator };
export default ScriptGenerator;
