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
					<v-text-field :disabled="!useUpstream" label="Upstream Address" v-model="upstreamAddr" @keypress="txtKeyAddrPress" />
					<v-text-field :disabled="!useUpstream" label="Upstream Port" mask="#####" v-model="upstreamPort" @keypress="txtKeyPortPress" ref="addr" />
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
				upstreamAddr: '127.0.0.1',
				upstreamPort: 8080
			}
		},
		methods: {
			show (item : string, upstream : false|{ addr: string, port: number }, callback : (response : false|{addr:string,port:number}) => void) {
				this.subdomain = item;
				this.listener = callback;
				this.useUpstream = !!upstream;
				this.upstreamAddr = upstream ? upstream.addr : '127.0.0.1';
				this.upstreamPort = upstream ? upstream.port : 8080;
				this.visible = true;
			},
			txtKeyAddrPress (ev : KeyboardEvent) {
				var key = ev.keyCode || ev.which || ev.charCode;
				if (key === 13 || key === 10) {
					ev.preventDefault ();
					this.$refs.addr.focus ();
				}
			},
			txtKeyPortPress (ev : KeyboardEvent) {
				var key = ev.keyCode || ev.which || ev.charCode;
				if (key === 13 || key === 10) {
					ev.preventDefault ();
					this.apply ();
				}
			},
			apply () {
				this.visible = false;
				this.listener (this.useUpstream && {
					addr: this.upstreamAddr,
					port: parseInt (this.upstreamPort)
				});
			}
		}
	});
</script>
