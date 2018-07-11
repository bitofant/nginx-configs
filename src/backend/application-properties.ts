const ENV_PROD = 'production';
const ENV_DEV = 'development';

const ENV_DEFAULT = ENV_PROD;

const T_SECONDS = 1000;
const T_MINUTES = 60 * T_SECONDS;
const T_HOURS = 60 * T_MINUTES;


const ENV = process.env.NODE_ENV || ENV_DEFAULT;

const IS_DEV = (ENV === ENV_DEV);
const IS_PROD = (ENV === ENV_PROD);


console.log ('profile = ' + ENV);

export default {
	port: process.env.HTTP_PORT || process.env.PORT || 8080,
	env: {
		name: ENV,
		dev: IS_DEV,
		prod: IS_PROD
	},
	storageFile: __dirname + '/config.json',
	aggressiveTimeouts: (ENV === ENV_DEV)
};


