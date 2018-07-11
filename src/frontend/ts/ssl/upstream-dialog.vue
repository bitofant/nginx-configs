<style lang="scss" scoped>
	
</style>


<template>
	<v-dialog
			v-model="visible"
			width="500">
		<v-card>
			<v-card-title class="headline grey lighten-2" primary-title v-text="subdomain" />

			<v-card-text>
				Would you like to configure this subdomain as an upstream service?
				<v-layout align-center>
					<v-checkbox v-model="useUpstream" hide-details class="shrink mr-2" color="primary"></v-checkbox>
					<v-text-field :disabled="!useUpstream" label="Upstream port" mask="#####" v-model="upstreamPort" @keypress="txtKeyPress" />
				</v-layout>
			</v-card-text>

			<v-divider />

			<v-card-actions>
				<v-spacer />
				<v-btn color="primary" flat @click="apply">Apply</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>


<script lang="ts">
	import Vue from 'vue';
	
	export default Vue.extend ({
		name: 'upstream-dialog',
		data () {
			return {
				subdomain: '',
				visible: false,
				listener: null,
				useUpstream: false,
				upstreamPort: 8080
			}
		},
		methods: {
			show (item : string, upstream : number, callback : (response : string) => void) {
				this.subdomain = item;
				this.listener = callback;
				this.useUpstream = !!upstream;
				this.upstreamPort = upstream || 8080;
				this.visible = true;
			},
			txtKeyPress (ev) {
				var key = ev.keyCode || ev.which || ev.charCode;
				if (key === 13 || key === 10) this.apply ();
			},
			apply () {
				this.visible = false;
				this.listener (this.useUpstream && parseInt (this.upstreamPort));
			}
		}
	});
</script>
