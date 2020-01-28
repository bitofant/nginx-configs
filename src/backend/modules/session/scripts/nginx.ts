import { SSLZone } from "../../config";

const base = `#
# Default server
#
server {
	listen 80;
	server_name $(domains);

	location ^~ /.well-known {
		root $(docroot);
	}

	location / {
		root $(docroot);
		index index.php index.html index.htm;
		add_header X-Riddle UmVhbGx5PyBZb3UgZGVjb2RlZCB0aGlzPyA6LUQ=;
	}

	error_page 404 /404.html;
	location = /404.html {
		root /usr/share/nginx/html;
	}

	# redirect server error pages to the static page /50x.html
	error_page 500 502 503 504 /50x.html;
	location = /50x.html {
		root /usr/share/nginx/html;
	}

$(php)	location ~ \.php$ {
$(php)		fastcgi_pass 127.0.0.1:9000;
$(php)		fastcgi_index index.php;
$(php)		fastcgi_param SCRIPT_FILENAME $(docroot)/$fastcgi_script_name;
$(php)		include /etc/nginx/fastcgi_params;
$(php)		add_header X-Riddle UmVhbGx5PyBZb3UgZGVjb2RlZCB0aGlzPyA6LUQ=;
$(php)	}

	location ~ /.+\.deny$ {
		deny all;
		return 404;
	}
}

#
# SSL server
#
server {
	listen 443;
	server_name $(domains);

	ssl on;
	ssl_certificate     $(cert.fullchain);
	ssl_certificate_key $(cert.key);

	location / {
			root $(docroot);
			index index.php index.html index.htm;
			add_header X-Riddle UmVhbGx5PyBZb3UgZGVjb2RlZCB0aGlzPyA6LUQ=;
	}

$(php)	location ~ \.php$ {
$(php)		fastcgi_pass 127.0.0.1:9000;
$(php)		fastcgi_index index.php;
$(php)		fastcgi_param SCRIPT_FILENAME $(docroot)/$fastcgi_script_name;
$(php)		include /etc/nginx/fastcgi_params;
$(php)		add_header X-Riddle UmVhbGx5PyBZb3UgZGVjb2RlZCB0aGlzPyA6LUQ=;
$(php)	}

	location ~ /.+\.deny$ {
			deny all;
			return 404;
	}
}

#
# subdomains
#
server {
	listen 80;
	server_name ~^(www\.)?(?<domain>.+)\.($(regexDomains))$;

	client_max_body_size 64M;

	root $(subdocroot)/$domain;
	index index.php index.html index.htm;

	location ^~ /.well-known {
			root $(docroot);
	}

	location ~ \.php$ {
			fastcgi_pass 127.0.0.1:9000;
			fastcgi_index index.php;
			fastcgi_param SCRIPT_FILENAME $(subdocroot)/$domain/$fastcgi_script_name;
			include /etc/nginx/fastcgi_params;
	}

	location ~ /.+\.deny$ {
			deny all;
			return 404;
	}

	error_log /var/log/nginx/$(url).subdomains.error.log;
}

#
# SSL subdomains
#
server {
	listen 443;
	server_name ~^(www\.)?(?<domain>.+)\.($(regexDomains))$;

	client_max_body_size 64M;

	ssl on;
	ssl_certificate     $(cert.fullchain);
	ssl_certificate_key $(cert.key);

	root $(subdocroot)/$domain;
	index index.php index.html index.htm;

	error_log /var/log/nginx/$(url).subdomains.error.log;

$(php)	location ~ \.php$ {
$(php)			fastcgi_pass 127.0.0.1:9000;
$(php)			fastcgi_index index.php;
$(php)			fastcgi_param SCRIPT_FILENAME $(subdocroot)/$domain/$fastcgi_script_name;
$(php)			fastcgi_param HTTPS on;
$(php)			include /etc/nginx/fastcgi_params;
$(php)	}

	location ~ /.+\.deny$ {
			deny all;
			return 404;
	}
}`;

function createNginxConfig (zone : SSLZone) : string {
	var domains : Array<string> = [];
	zone.domainConfigs.forEach (cfg => {
		domains.push (cfg.tld);
		domains.push ('www.' + cfg.tld);
		// cfg.subdomains.forEach (subdomain => {
		// 	domains.push (subdomain + '.' + cfg.tld);
		// });
	});
	var replace = {
		url: domains[0],
		domains: domains.join (' '),
		regexDomains: domains.join ('|').split ('.').join ('\\.'),
		'cert.fullchain': zone.certFullChain,
		'cert.key': zone.certPrivateKey,
		docroot: zone.path,
		subdocroot: zone.subdomainPath,
		php: zone.includePHP ? '' : '# '
	};
	if (replace.docroot.endsWith ('/')) replace.docroot = replace.docroot.substr (0, replace.docroot.length - 1);
	if (replace.subdocroot.endsWith ('/')) replace.subdocroot = replace.subdocroot.substr (0, replace.subdocroot.length - 1);
	var scr = '' + base;
	for (var k in replace) {
		scr = scr.split ('$(' + k + ')').join (replace[k]);
	}
	return scr;
}

export { createNginxConfig };
export default createNginxConfig;
