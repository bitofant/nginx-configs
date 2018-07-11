<style lang="scss" scoped>
</style>


<template>
	<v-container fluid>
		<v-expansion-panel inset>
			<v-expansion-panel-content v-for="(zone, i) in zones" :key="origZones[i].name">
				<h3 slot="header" v-text="origZones[i].name" />
				<v-card>
					<v-card-text>
						<v-layout row wrap>
							<v-flex pl-1 pr-2>
								<v-text-field v-model="zone.name"           label="Name" :rules="[rules.nameLength]" />
							</v-flex>
							<v-flex style="flex: 0 1 auto">
								<v-switch color="primary" label="PHP" v-model="zone.includePHP" />
							</v-flex>
						</v-layout>
						<v-layout row wrap>
							<v-flex xs12 md6 px-1>
								<v-text-field v-model="zone.certFullChain"  label="Full chain path" />
							</v-flex>
							<v-flex xs12 md6 px-1>
								<v-text-field v-model="zone.certPrivateKey" label="Private key path" />
							</v-flex>
							<v-flex xs12 md6 px-1>
								<v-text-field v-model="zone.path"           label="Document root" />
							</v-flex>
							<v-flex xs12 md6 px-1>
								<v-text-field v-model="zone.subdomainPath"  label="Subdomain document root" />
							</v-flex>
							<v-flex xs12 class="text-xs-right">
								<v-btn color="error" @click="remove (zone)">Remove</v-btn>
								<v-btn color="primary" @click="save (zone, origZones[i].name)">Save</v-btn>
							</v-flex>
						</v-layout>
					</v-card-text>
				</v-card>
			</v-expansion-panel-content>
			<v-expansion-panel-content>
				<h3 slot="header">Add Zone</h3>
				<v-card>
					<v-card-text>
						<v-layout row wrap>
							<v-flex pl-1 pr-2>
								<v-text-field :disabled="addingEntry" v-model="add.name"  label="Name" :rules="[rules.nameLength, rules.unique]" />
							</v-flex>
							<v-flex style="flex: 0 1 auto">
								<v-switch :disabled="addingEntry" color="primary" label="PHP" v-model="add.includePHP" />
							</v-flex>
						</v-layout>
						<v-layout row wrap>
							<v-flex xs12 md6 px-1>
								<v-text-field v-model="add.certFullChain"  label="Full chain path" />
							</v-flex>
							<v-flex xs12 md6 px-1>
								<v-text-field v-model="add.certPrivateKey" label="Private key path" />
							</v-flex>
							<v-flex xs12 md6 px-1>
								<v-text-field v-model="add.path"           label="Document root" />
							</v-flex>
							<v-flex xs12 md6 px-1>
								<v-text-field v-model="add.subdomainPath"  label="Subdomain document root" />
							</v-flex>
							<v-flex xs12 class="text-xs-right">
								<v-btn color="primary" @click="addZone" :disabled="addingEntry">Add</v-btn>
							</v-flex>
						</v-layout>
					</v-card-text>
				</v-card>
			</v-expansion-panel-content>
		</v-expansion-panel>
	</v-container>
</template>


<script lang="ts">
	import Vue from 'vue';
	import { config, SSLZone } from '../config';
	import socket from '../sock';
	
	export default Vue.extend ({
		name: 'ssl-zones',
		data () {
			return {
				origZones: config.sslZones,
				zones: (function () {
					// create array with copies of each object in <config.sslZones>
					var ret = [];
					config.sslZones.forEach (zone => ret.push (Object.assign ({}, zone)));
					return ret;
				}) (),
				add: {
					name: '',
					certFullChain: '',
					certPrivateKey: '',
					includePHP: true,
					path: '',
					subdomainPath: ''
				},
				addingEntry: false,
				rules: {
					nameLength: name => name.length > 1 || 'Zone name too short',
					unique: name => !config.sslZones.find (zone => zone.name === name) || 'Zone name must be unique!'
				}
			}
		},
		methods: {
			// editZone (zone : SSLZone, id : 'name'|'chain'|'key', val) {
			// 	console.log (zone.name + ', ' + id + ', ' + JSON.stringify (val));
			// 	var ind = config.sslZones.findIndex (testzone => testzone === zone);
			// 	if (ind < 0) throw Error ('wtf?!');
			// 	if (ind !== this.editing.index) {
			// 		this.editing.index = ind;
			// 		const translation = { name: 'name', chain: 'certFullChain', key: 'certPrivateKey' };
			// 		for (var k in translation) this.editing[k] = zone[translation[k]];
			// 	}
			// 	this.editing[id] = val;
			// },
			addZone () {
				if (this.rules.unique (this.add.name) !== true) return;
				this.addingEntry = true;
				socket.once ('zone:added', () => {
					this.addingEntry = false;
					this.add.name = '';
				});
				socket.emit ('zone:add', this.add);
			},
			remove (zone : SSLZone) {
				socket.emit ('zone:remove', zone);
			},
			save (zone : SSLZone, oldName : string) {
				socket.emit ('zone:update', { oldName, zone });
			}
		},
		watch: {
			'origZones': {
				handler: function () {
					// elements removed? make array shorter
					if (config.sslZones.length < this.zones.length) {
						this.zones.length = config.sslZones.length;
					}
					// copy values into objects
					config.sslZones.forEach ((zone, i) => {
						// element added? append to array
						if (i >= this.zones.length) {
							this.zones.push (Object.assign ({}, zone));
						} else {
							this.zones[i] = Object.assign (this.zones[i], zone);
						}
					});
				},
				deep: true
			}
		}
	});
</script>
