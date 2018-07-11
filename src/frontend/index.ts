import './style.scss';

import props from './application-properties';
import Vue from 'vue';
// import VueRouter from 'vue-router';
// import App from './vue/app.vue';
// import sock from './js/sock';
import VueRouter from 'vue-router';
import Vuetify from 'vuetify';
import App from './ts/app.vue';
import sock from './ts/sock';

Vue.use (VueRouter);
Vue.use (Vuetify, props.vuetifyOptions);

var v = new Vue ({
	el: '#app',
	render: h => h(App)
});

sock.on ('refresh', () => {
	document.location.reload ();
});
