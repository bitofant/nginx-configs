<style lang="scss" scoped>
	
</style>


<template>
	<v-snackbar
			top right
			v-model="visible"
			:timeout="timeout">
		<div v-if="message" v-text="message" />
		<div v-else-if="html" v-html="html" />
	</v-snackbar>
</template>


<script lang="ts">
	import Vue from 'vue';
	import { bus, SnackbarMessage } from './bus';

	export default Vue.extend ({
		name: 'snackbar',
		props: [],
		data () {
			return {
				visible: false,
				timeout: 5000,
				message: null,
				html: null
			}
		},
		methods: {
			onSnackbar (msg : SnackbarMessage) {
				this.message = msg.text || null;
				this.html = msg.html || null;
				this.timeout = msg.timeout || 5000;
				this.visible = true;
				console.log ('should be visible oO');
			}
		},
		created () {
			bus.on ('snackbar', this.onSnackbar);
		},
		beforeDestroy () {
			bus.removeListener ('snackbar', this.onSnackbar);
		}
	});
</script>
