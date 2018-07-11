<style lang="scss" scoped>
	
</style>


<template>
	<v-form v-if="hasZone ()">
		<v-container fluid>
			<v-layout>
				<v-flex xs12 sm8 offset-sm2 md6 offset-md3>
					<v-card>
						<v-card-title primary-title>
							<v-layout row wrap>
								<v-flex xs12>
									<h3>Configure <a :href="'http://'+zone.name" target="_blank" v-text="zone.name" /></h3>
								</v-flex>
								<v-flex xs12>
									<v-combobox
											v-model="domains"
											:items="items"
											:search-input.sync="search"
											hide-selected
											label="Domains"
											multiple
											small-chips
											@input="domainsChanged">
										<template slot="no-data">
											<v-list-tile>
												<v-list-tile-content>
													<v-list-tile-title v-if="!search || search.length < 4 || search.indexOf ('.') < 0 || search.startsWith ('.') || search.endsWith ('.')">
														Please enter a top level domain, e.g. "my-domain.com"
													</v-list-tile-title>
													<v-list-tile-title v-else>
														Press <kbd>enter</kbd> to add <span style="font-weight: bold; color: #06c; text-decoration: underline" v-text="search" />
													</v-list-tile-title>
												</v-list-tile-content>
											</v-list-tile>
										</template>
									</v-combobox>
								</v-flex>
								<v-flex xs12>
									<v-list two-line>
										<template v-for="item in uniqueSubdomains">
											<v-list-tile :key="item" avatar>
												<v-avatar class="white--text" :class="isUpstream.includes (item) ? 'secondary' : 'primary'" v-text="item.substr (0, 1).toUpperCase ()" />
												<v-list-tile-content>
													<v-list-tile-title>
														&nbsp; <span style="font-weight:bold" v-text="item" />
														<span v-if="isUpstream.includes (item)" v-text="' :' + upstream[item]" />
													</v-list-tile-title>
													<v-list-tile-sub-title>
														<template>
															<v-layout>
																<v-flex
																 		v-for="domain in domains"
																		:key="domain"
																		class="display: inline-block">
																	<v-switch
																			:label="domain"
																			v-model="subdomains"
																			:value="item + '.' + domain"
																			:color="isUpstream.includes (item) ? 'secondary' : 'primary'" />
																</v-flex>
															</v-layout>
															<v-divider></v-divider>
														</template>
													</v-list-tile-sub-title>
												</v-list-tile-content>
												<v-list-tile-action>
													<v-layout>
														<v-flex>
															<v-btn icon ripple>
																<v-icon color="grey lighten-1" @click="createUpstream (item)">settings</v-icon>
															</v-btn>
														</v-flex>
														<v-flex>
															<v-btn icon ripple @click="remove (item)">
																<v-icon color="grey lighten-1">delete</v-icon>
															</v-btn>
														</v-flex>
													</v-layout>
												</v-list-tile-action>
											</v-list-tile>
										</template>
									</v-list>
								</v-flex>
								<v-flex >
									<v-text-field
											label="Add" box
											v-model="subdomainToAdd"
											:append-outer-icon="subdomainToAdd.length > 1 ? 'send' : null"
											@click:append-outer="addSubdomain"
											@keypress="subdomainKeyPress"
											:disabled="saving" />
								</v-flex>
								<v-flex  class="text-xs-right" style="flex: 0 1 auto">
									<v-btn color="primary" v-text="'Save'" @click="save" :disabled="saving" />
								</v-flex>
							</v-layout>
						</v-card-title>
					</v-card>
				</v-flex>
			</v-layout>
		</v-container>
		<upstream-dialog ref="upstreamDialog" />
	</v-form>
</template>


<script lang="ts">
	import Vue from 'vue';
	import { config, SSLZone, DomainConfig } from '../config';
	import { sock } from '../sock';
	import UpstreamDialog from './upstream-dialog.vue';

	
	export default Vue.extend ({
		name: 'ssl-zone-config',
		components: {
			UpstreamDialog
		},
		data () {
			return {
				saving: false,
				domains: [],
				items: [],
				search: null,
				zone: null,
				subdomains: [],
				uniqueSubdomains: [],
				isUpstream: [],
				upstream: {},
				subdomainToAdd: ''
			}
		},
		methods: {
			hasZone () {
				if (!this.$route || !this.$route.params || !this.$route.params.zoneid) return false;
				var zone = config.sslZones.find (zone => zone.name === this.$route.params.zoneid);
				if (!zone) return false;
				if (this.zone !== zone) {
					this.zone = zone;
					this.zoneChanged ();
				}
				return true;
			},
			zoneChanged () {
				var zone : SSLZone = this.zone;
				this.search = null;
				this.domains.splice (0, this.domains.length);
				this.subdomains.splice (0, this.subdomains.length);
				this.uniqueSubdomains.splice (0, this.uniqueSubdomains.length);
				this.isUpstream.splice (0, this.isUpstream.length);
				this.upstream = {};
				zone.domainConfigs.forEach (domain => {
					this.domains.push (domain.tld);
					domain.subdomains.forEach (subdomain => {
						this.subdomains.push (subdomain + '.' + domain.tld);
						if (!this.uniqueSubdomains.includes (subdomain)) {
							this.uniqueSubdomains.push (subdomain);
							if (!this.upstream[subdomain]) {
								this.upstream[subdomain] = 0;
							}
						}
					});
					for (var k in domain.upstream) {
						if (!this.upstream[k]) {
							this.upstream[k] = domain.upstream[k];
						}
					}
				});
				this.uniqueSubdomains.sort ();
				for (var k in this.upstream) {
					if (this.upstream[k]) this.isUpstream.push (k);
				}
			},
			domainsChanged (val) {
				// console.log ('Domains changed: ' + val.join (', '));
			},
			subdomainKeyPress (ev) {
				var key = ev.keyCode || ev.which || ev.charCode;
				if (key === 13 || key === 10) this.addSubdomain ();
			},
			addSubdomain () {
				var dom = this.subdomainToAdd.toLowerCase ();
				if (dom.length < 2 || this.uniqueSubdomains.includes (dom)) return;
				this.subdomainToAdd = '';
				this.uniqueSubdomains.push (dom);
				this.uniqueSubdomains.sort ();
				if (!this.upstream[dom]) this.upstream[dom] = 0;
			},
			createUpstream (item) {
				this.$refs.upstreamDialog.show (item, this.upstream[item], response => {
					console.log (item, response);
					this.upstream[item] = response || 0;
					var index = this.isUpstream.findIndex (t => t === item);
					if (index >= 0) this.isUpstream.splice (index, 1);
					else console.error ('unable to remove from isUpstream');
					if (response) {
						this.isUpstream.push (item);
					}
				});
			},
			remove (subdomain : string) {
				this.domains.forEach (tld => {
					removeFromArray (this.subdomains, subdomain + '.' + tld);
				});
				removeFromArray (this.uniqueSubdomains, subdomain);
				removeFromArray (this.isUpstream, subdomain);
				if (typeof (this.upstream[subdomain]) !== 'undefined') {
					delete this.upstream[subdomain];
				}
			},
			save () {
				var zone : SSLZone = this.zone;
				var configs : Array<DomainConfig> = [];
				this.domains.forEach (tld => {
					var subdomains : Array<string> = [];
					this.subdomains.forEach (subdomain => {
						if (!subdomain.endsWith (tld)) return;
						subdomains.push (subdomain.substr (0, subdomain.length - tld.length - 1));
					});
					var upstream : { [subdomain: string]: number } = {};
					for (var k in this.upstream) {
						if (!this.upstream[k]) continue;
						if (!subdomains.includes (k)) continue;
						upstream[k] = this.upstream[k];
					}
					var cfg : DomainConfig = {
						tld,
						subdomains,
						upstream
					};
					configs.push (cfg);
				});
				var args : Array<any> = [ 0, zone.domainConfigs.length ];
				zone.domainConfigs.splice.apply (zone.domainConfigs, args.concat (configs));
				sock.emit ('zone:domains', {
					zone: zone.name,
					domainConfigs: zone.domainConfigs
				});
			}
		},
	});

	function removeFromArray (arr : Array<string>, item : string) {
		var i = arr.findIndex (cmp => cmp === item);
		if (i < 0) return false;
		arr.splice (i, 1);
		return true;
	}
</script>
