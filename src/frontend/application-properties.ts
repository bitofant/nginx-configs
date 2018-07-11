import { config } from './ts/config';

const props = {
	vuetifyOptions: {
		// iconfont: 'mdi', // 'md' || 'mdi || 'fa' || 'fa4'
		theme: {
			primary: '#1976D2',
			secondary: '#424242',
			accent: '#82B1FF',
			error: '#FF5252',
			info: '#2196F3',
			success: '#4CAF50',
			warning: '#FFC107'
		}
	},
	darkTheme: false,
	serverConfig: config
};

export { props };
export default props;
