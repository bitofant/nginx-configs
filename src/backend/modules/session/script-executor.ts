import fs = require ('fs');
import nodeSSH = require ('node-ssh');
import Logger from '../helper/logger';
const log = Logger (module);

function getOneOfTheseEnvironmentVariables (...args : Array<string>) : string {
	for (var i = 0; i < args.length; i++) {
		if (process.env[args[i]]) {
			return process.env[args[i]];
		}
	}
	throw Error ('None of these environment variables present... [' + args.join (', ') + ']');
}


function executeScript (server : string, user : string, script : string, callback: (stdout : string, stderr : string) => void) : void {
	log ('Executing script on ' + user + ' @ ' + server);
	const ssh = new nodeSSH ();
	var tmpName = Date.now () + '.sh';
	var localTmpFile = __dirname + '/' + tmpName;
	var remoteHomeDir = user === 'root' ? '/root' : ('/home/' + user);
	fs.writeFile (localTmpFile, script, 'utf8', err => {
		if (err) throw err;
		ssh.connect ({
			host: server,
			username: user,
			privateKey: '/Users/' + getOneOfTheseEnvironmentVariables ('SUDO_USER', 'LOGNAME', 'USER', 'LNAME', 'USERNAME') + '/.ssh/id_rsa'
		}).then (() => {
			ssh.putFile (localTmpFile, remoteHomeDir + '/' + tmpName).then (() => {
				var stdout = '', stderr = '';
				ssh.execCommand ('chmod u+x ' + tmpName, { cwd: remoteHomeDir }).then (result => {
					if (result.stdout) stdout += result.stdout + '\n';
					if (result.stderr) stderr += result.stderr + '\n';
					ssh.execCommand ('./' + tmpName, { cwd: remoteHomeDir }).then (result => {
						if (result.stdout) stdout += result.stdout + '\n';
						if (result.stderr) stderr += result.stderr + '\n';
						ssh.execCommand ('rm -f ' + tmpName, { cwd: remoteHomeDir }).then (result => {
							if (result.stdout) stdout += result.stdout + '\n';
							if (result.stderr) stderr += result.stderr + '\n';
							callback (stdout, stderr);
						});
					});
				});
			});
		});
	});
}

export { executeScript };
export default executeScript;
