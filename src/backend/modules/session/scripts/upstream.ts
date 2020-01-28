import { SSLZone } from "../../config";

const base = `
upstream $(url) {
	server $(addr):$(port);
}

server {
	server_name $(url);
	access_log /var/log/nginx/$(url).access.log;

	location ^~ /.well-known {
		root /var/www/html;
	}
	return 301 https://$host$request_uri;
}
server {
	listen       443;
	server_name  $(url);

	ssl                  on;
	ssl_certificate      $(cert.fullchain);
	ssl_certificate_key  $(cert.key);

	access_log /var/log/nginx/$(url).ssl.access.log;

	location ^~ /.well-known {
		root /var/www/html;
	}

	location / {
		proxy_set_header X-Real_IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header Host $http_host;
		proxy_set_header X-NginX-Proxy true;
		proxy_pass http://$(url)/;
		proxy_redirect off;
	}

	location /socket.io/ {
		proxy_pass http://$(url)/socket.io/;
		proxy_http_version 1.1;
		proxy_set_header Upgrade $http_upgrade;
		proxy_set_header Connection "Upgrade";
	}
}
`;

function createNginxUpstreamConfig (zone : SSLZone, domain : string, subdomain : string, upstream : { addr: string, port: number }) : string {
	var replace = {
		url: subdomain + '.' + domain,
		addr: upstream.addr,
		port: upstream.port,
		'cert.fullchain': zone.certFullChain,
		'cert.key': zone.certPrivateKey
	};
	var scr = '' + base;
	for (var k in replace) {
		scr = scr.split ('$(' + k + ')').join (replace[k]);
	}
	return scr;
}

export { createNginxUpstreamConfig };
export default createNginxUpstreamConfig;
