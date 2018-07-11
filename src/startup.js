const readline = require ('readline');
const { spawn } = require ('child_process');
const fs = require ('fs');

const c = {
	clearLine: '\033[K',
	moveUp: '\033[1A',
	moveLeft: '\r'
};

var package = JSON.parse (fs.readFileSync (__dirname + '/../package.json'));

var CHILD_SPAWNED = null;

const options = [];
var cats = {};
var co = [];
for (var k in package.scripts) {
	if (k === 'start') continue;
	let t = k.split (':');
	if (!cats[t[0]]) cats[t[0]] = 1;
	else cats[t[0]]++;
	co.push (t);
}
co.sort ((a, b) => {
	if (a[0] === 'start' && b[0] !== 'start') return -1;
	if (b[0] === 'start' && a[0] !== 'start') return 1;
	return a.join (':') > b.join (':') ? 1 : -1;
});
co.forEach ((so, i) => {
	if (so.length === 1) {
		options.push ({
			name: so[0],
			script: so[0]
		});
	} else if (cats[so[0]] === 1) {
		options.push ({
			name: so.join (':'),
			script: so.join (':')
		});
	} else {
		if (i === 0 || co[i - 1][0] !== so[0]) {
			options.push ({
				name: so[0],
				script: null
			});
		}
		options.push ({
			name: '   ' + so[1],
			script: so.join (':')
		});
	}
});

options.push ({
	name: 'count lines of code and classes',
	script: '!'
});

var selected = options[0].script ? 0 : 1;

function printScreen () {
	console.log ('Plase choose:');
	options.forEach ((option, i) => {
		if (option.script) {
			console.log ('  (' + (selected === i ? 'x' : ' ') + ') ' + option.name);
		} else {
			console.log ('      ' + option.name);
		}
	});
	console.log ('');
}

function clearScreen () {
	var s = [];
	s.length = options.length + 3;
	for (var i = 0; i < s.length; i++) s[i] = c.moveUp + c.clearLine;
	console.log (s.join (''));
}

console.log (c.moveUp + c.moveUp + c.clearLine + c.moveUp + c.clearLine + c.moveUp);
printScreen ();


readline.emitKeypressEvents (process.stdin);
process.stdin.setRawMode (true);
process.stdin.on ('keypress', (a, b) => {
	switch (b.sequence) {
		case '\u001b[A':
			if (CHILD_SPAWNED) break;
			if (selected > 0 && (!options[0].script || selected > 1)) {
				selected--;
			} else {
				selected = options.length - 1;
			}
			if (!options[selected].script) selected--;
			if (selected === -1) selected = options.length - 1;
			clearScreen ();
			printScreen ();
			break;
		case '\u001b[B':
			if (CHILD_SPAWNED) break;
			if (selected < options.length - 1) {
				selected++;
			} else {
				selected = 0;
			}
			if (!options[selected].script) selected++;
			clearScreen ();
			printScreen ();
			break;
		case '\r':
		case '\n':
			if (CHILD_SPAWNED) break;
			if (options[selected].script === '!') {
				CHILD_SPAWNED = true;
				countLinesOfCodeAnNumberOfClasses (() => {
					cleanUp ();
					process.exit ();
				});
				return;
			}
			process.stdout.write (c.moveUp);
			CHILD_SPAWNED = spawn ('npm', ['run', options[selected].script], { stdio: 'inherit' }).on ('exit', () => {
				cleanUp ();
				process.exit ();
			});
			break;
		case 'q':
			if (CHILD_SPAWNED) break;
		case '\u0003':
			if (CHILD_SPAWNED && CHILD_SPAWNED.kill) {
				CHILD_SPAWNED.kill ();
			}
			cleanUp ();
			break;
		default:
			if (CHILD_SPAWNED) break;
			var cseq = '' + b.sequence;
			for (var i = 0; i < options.length; i++) {
				if (cseq > options[i]) {
					selected = i;
					clearScreen ();
					printScreen ();
					process.stdout.write (cseq + '\r');
					break;
				}
			}
			//process.stdout.write (JSON.stringify (b, null, 4));
	}
});

process.stdin.on ('error', err => {});



function cleanUp () {
	// process.stdin.setRawMode (false);
	// process.stdin.removeAllListeners ('keypress');
	// process.nextTick (() => {
		process.exit ();
	// });
}


const stats = {
	deltaT: 0,
	lines: 0,
	files: 0
};
function countLinesOfCodeAnNumberOfClasses (cb, folder) {
	if (!folder) {
		folder = __dirname;
		stats.deltaT = Date.now ();
		var origCB = cb;
		cb = () => {
			countingDone ();
			origCB ();
		};
	}
	fs.stat (folder, (err, st) => {
		if (err) {
			console.log (err);
			cb ();
		} else if (st.isDirectory ()) {
			fs.readdir (folder, (err, files) => {
				if (err) {
					console.log (err);
					cb ();
				} else if (files.length === 0) {
					cb ();
				} else {
					var remaining = files.length;
					files.forEach (file => {
						countLinesOfCodeAnNumberOfClasses (() => {
							if (--remaining === 0) cb ();
						}, folder + '/' + file);
					});
				}
			});
		} else {
			if ([ 'jpg', 'jpeg', 'bmp', 'png', 'ico', 'gif' ].includes (folder.split ('.').pop ().toLowerCase ())) {
				stats.files++;
				cb ();
			} else {
				fs.readFile (folder, 'utf8', (err, data) => {
					if (err) {
						console.log (err);
						cb ();
					} else {
						stats.files++;
						stats.lines += data.split ('\n').length;
						cb ();
					}
				});
			}
		}
	});
}

function countingDone () {
	stats.deltaT = (Date.now () - stats.deltaT) / 1000;
	console.log (JSON.stringify (stats, null, 4));
}

/*

const stdin = process.openStdin ();
stdin.setRawMode (true);
stdin.addListener ('data', (str, key) => {
	console.log (arguments[2]);
});

*/

// for (var i = 0; i < 100; i++) {
// 	clearScreen ();
// 	printScreen ();
// }
//printScreen ();


/*
const fs = require ('fs');

var package = JSON.parse (fs.readFileSync (__dirname + '/../package.json'));

const options = [];
var cats = {};
var co = [];
for (var k in package.scripts) {
	if (k === 'start') continue;
	let t = k.split (':');
	if (!cats[t[0]]) cats[t[0]] = 1;
	else cats[t[0]]++;
	co.push (t);
}
co.sort ((a, b) => {
	if (a[0] === 'start' && b[0] !== 'start') return -1;
	if (b[0] === 'start' && a[0] !== 'start') return 1;
	return a.join (':') > b.join (':') ? 1 : -1;
});
co.forEach ((so, i) => {
	if (so.length === 1) {
		options.push ({
			name: so[0],
			script: so[0]
		});
	} else if (cats[so[0]] === 1) {
		options.push ({
			name: so.join (':'),
			script: so.join (':')
		});
	} else {
		if (i === 0 || co[i - 1][0] !== so[0]) {
			options.push ({
				name: so.join (':'),
				script: so.join (':')
			});
		} else {
			options.push ({
				name: '   ' + so[1],
				script: so.join (':')
			});
		}
	}
});

options.forEach (option => {
	console.log (option.name);
	console.log (option.script);
});

*/