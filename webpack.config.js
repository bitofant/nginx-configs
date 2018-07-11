var webpack = require('webpack')
//var nodeExternals = require ('webpack-node-externals');
var fs = require('fs');

var DIST_FOLDER = __dirname + '/dist/';


const frontend = {
	entry: './src/frontend/index.ts',
	output: {
		path: DIST_FOLDER + '/htdocs',
		publicPath: '/dist/',
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'vue-style-loader',
					'css-loader'
				],
			},
			{
				test: /\.scss$/,
				use: [
					'vue-style-loader',
					'style-loader',
					'css-loader',
					// {
					//   loader: 'postcss-loader', // Run post css actions
					//   options: {
					//     plugins: function () { // post css plugins, can be exported to postcss.config.js
					//       return [
					//         require('precss'),
					//         require('autoprefixer')
					//       ];
					//     }
					//   }
					// },
					'sass-loader'
				],
			},
			{
				test: /\.sass$/,
				use: [
					'vue-style-loader',
					'css-loader',
					'sass-loader?indentedSyntax'
				],
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader',
				options: {
					loaders: {
						'scss': [
							'vue-style-loader',
							'css-loader',
							'sass-loader'
						],
						'sass': [
							'vue-style-loader',
							'css-loader',
							'sass-loader?indentedSyntax'
						]
					}
					// other vue-loader options go here
				}
			},
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},
			{
				test: /\.(png|jpg|gif|svg)$/,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]?[hash]'
				}
			},
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: '/node_modules|vue|src\/backend/',
				options: {
					appendTsSuffixTo: [/\.vue$/],
					configFile: 'tsconfig.frontend.json'
				}
			}
		]
	},
	resolve: {
		alias: {
			'vue$': 'vue/dist/vue.esm.js' //,
			// 'backend': __dirname + '/src/backend',
			// 'frontend': __dirname + '/src/frontend'
		},
		extensions: ['*', '.ts', '.js', '.vue', '.json']
	},
	devServer: {
		historyApiFallback: true,
		noInfo: true,
		overlay: true
	},
	performance: {
		hints: false
	},
	devtool: '#eval-source-map'
}



//#################################################################



// const backend = {
//   entry: './src/app.ts',
//   target: 'node',
//   externals: [
//     nodeExternals ()
//   ],
//   output: {
//     path: DIST_FOLDER,
//     publicPath: '/dist/',
//     filename: 'bundle.js',
//     libraryTarget: 'commonjs'
//   },
//   module: {
//     rules: [
//       {
//         test: /\.tsx?$/,
//         use: 'ts-loader',
//         exclude: /node_modules/
//       }
//     ]
//   },
//   resolve: {
//     extensions: ['.tsx', '.ts', '.js', '.json']
//   }
// }



//#################################################################




/**
 * 
 * @param {string} dir 
 */
function ensureDirExistsSync(dir) {
	if (!fs.existsSync(dir)) {
		var splitted = dir.split('/');
		function next(i) {
			if (i < 1) return;
			if (fs.existsSync(splitted.slice(0, i).join('/'))) return;
			next(i - 1);
			fs.mkdirSync(splitted.slice(0, i).join('/'));
		}
		next(splitted.length - 1);
		fs.mkdirSync(dir);
	}
}

/**
 * 
 * @param {string} file 
 * @param {string=} srcFolder
 */
function copy(file, srcFolder) {
	if (!srcFolder) srcFolder = '/src/frontend/';
	fs.copyFile(__dirname + srcFolder + file, DIST_FOLDER + 'htdocs/' + file, err => {
		if (err) throw err;
	});
}

function copyFolder (folder) {
	ensureDirExistsSync (DIST_FOLDER + 'htdocs/' + folder);
	fs.exists ('./src/frontend/' + folder, exists => {
		if (!exists) return;
		fs.readdir ('./src/frontend/' + folder, (err, files) => {
			if (err) throw err;
			files.forEach (file => {
				fs.stat ('./src/frontend/' + folder + '/' + file, (err, stats) => {
					if (err) throw err;
					if (stats.isDirectory ()) {
						copyFolder (folder + '/' + file);
					} else {
						copy (folder + '/' + file);
					}
				});
			})
		});
	})
}


function twoDigits (n) {
	var s = n.toString ();
	while (s.length < 2) s = '0' + s;
	return s;
}



//#################################################################




ensureDirExistsSync (DIST_FOLDER + 'htdocs');
copy ('index.html');
copy ('favicon.ico');
copy ('log.html');
copyFolder ('img');


module.exports = [
	frontend
	//backend
];


if (process.env.NODE_ENV === 'production') {
	frontend.devtool = '#source-map'
	// http://vue-loader.vuejs.org/en/workflow/production.html
	frontend.plugins = (frontend.plugins || []).concat([
		new webpack.DefinePlugin ({
			'process.env': {
				NODE_ENV: '"production"'
			}
		}),
		// new webpack.optimize.UglifyJsPlugin({
		//   sourceMap: true,
		//   compress: {
		//     warnings: false
		//   }
		// }),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		})
	])
};


