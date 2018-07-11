<style lang="scss" scoped>
	
</style>


<template>
	<div id="app">
		<v-app id="img" :dark="props.darkTheme">
			<v-navigation-drawer
					v-model="drawer"
					fixed
					app>
				<v-list dense>
					<template v-for="(item, i) in menu">
						<v-layout
								v-if="item.text"
								:key="i + item.text">
							<v-flex xs6><v-subheader v-text="item.text" /></v-flex>
						</v-layout>
						<v-divider
								v-else-if="item.divider"
								:key="i + 'divider'"
								dark
								class="my-3" />
						<v-list-tile
								v-else-if="item.path && !item.invisible"
								:key="item.path"
								@click="navigate (item.path)">
							<v-list-tile-action>
								<v-icon v-text="item.icon" />
							</v-list-tile-action>
							<v-list-tile-content>
								<v-list-tile-title v-text="item.name" />
							</v-list-tile-content>
						</v-list-tile>
					</template>
				</v-list>
			</v-navigation-drawer>
			<v-toolbar
					color="primary"
					dark
					fixed
					app>
				<v-toolbar-side-icon @click.stop="drawer = !drawer" />
				<v-toolbar-title v-text="getRouteTitle()" />
			</v-toolbar>
			<v-content>
				<router-view />
			</v-content>
			<v-footer
					color="secondary"
					dark
					app>
				<div style="text-align: center">
					&copy; Jöran Tesse
				</div>
			</v-footer>
			<snackbar />
		</v-app>
	</div>
</template>


<script lang="ts">
	import Vue from 'vue';
	import { menu, getRoutes } from './menu.vue';
	import VueRouter from 'vue-router';
	import props from '../application-properties';
	import Snackbar from './snackbar.vue';

	
	export default Vue.extend ({
		name: 'app',
		router: new VueRouter ({ routes: getRoutes () }),
		components: {
			Snackbar
		},
		data () {
			return {
				drawer: null,
				menu,
				props
			}
		},
		methods: {
			getRouteTitle () {
				if (this.$route && this.$route.name) {
					var title : string = this.$route.name;
					for (var k in this.$route.params) {
						title = title.split ('$(' + k + ')').join (this.$route.params[k]);
					}
					return title;
				}
				console.error ('Unable to find route name for ', this.$route);
				return 'Route name undefined';
			},
			navigate (to) {
				this.$router.push (to);
			}
		},
	});
</script>
