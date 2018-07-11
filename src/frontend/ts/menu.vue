<script lang="ts">
	import { RouteConfig } from "vue-router";
	import Home from './home/home.vue';
	import Setup from './setup/setup.vue';
	import SSLZones from './ssl/zones.vue';
	import ZoneConfig from './ssl/zone-config.vue';
	import { config } from "./config";
	import Exec from './exec/exec.vue';


	interface MenuEntry extends RouteConfig {
		name: string,
		icon: string,
		invisible?: true
	};

	interface TextEntry {
		text: string
	}

	interface Divider {
		divider: true
	}

	const menu : Array<MenuEntry|TextEntry|Divider> = [
		{
			text: 'General'
		},
		{
			path: '/',
			alias: '/home',
			name: 'Home',
			icon: 'home',
			component: Home 
		},
		{
			path: '/setup',
			name: 'Setup',
			icon: 'settings',
			component: Setup
		},
		{
			path: '/ssl-zones',
			name: 'SSL Zones',
			icon: 'security',
			component: SSLZones
		},
		{
			path: '/exec',
			name: 'Execute',
			icon: 'backup',
			component: Exec
		},
		{ divider: true },
		{ text: 'Zones' },
		{
			path: '/ssl-zones/:zoneid',
			name: 'SSL Zone $(zoneid)',
			icon: 'security',
			invisible: true,
			component: ZoneConfig
		}
	];


	function isRouteConfig (obj : MenuEntry|TextEntry|Divider) : obj is MenuEntry {
		var keys = Object.keys (obj);
		if (keys.includes ('text') || keys.includes ('divider')) return false;
		return keys.includes ('path');
	}
	function getRoutes () : Array<MenuEntry> {
		var ret : Array<MenuEntry> = [];
		menu.forEach (item => {
			if (isRouteConfig (item) && item.component) ret.push (item);
		});
		return ret;
	}


	function updateZonesInMenu () {
		var ind = menu.findIndex (entry => isRouteConfig (entry) && entry.path === '/ssl-zones/:zoneid');
		if (ind < 0) throw new Error ('weird error: why can\'t I find the ssl zones entry in the menu?!');
		menu.splice (ind + 1, menu.length - ind);
		addZonesToMenu ();
	}
	function addZonesToMenu () {
		config.sslZones.forEach (zone => {
			menu.push ({
				name: zone.name,
				icon: 'assignment',
				path: '/ssl-zones/' + zone.name
			});
		});
	}
	addZonesToMenu ();

	export { menu, getRoutes, updateZonesInMenu };
	export default menu;
</script>
