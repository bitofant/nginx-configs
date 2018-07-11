<style lang="scss" scoped>
	
</style>


<template>
	<v-form>
		<v-container fluid>
			<v-layout>
				<v-flex xs12 sm6 offset-sm3 md4 offset-md4>
					<v-card>
						<v-card-title primary-title>
							<v-layout row wrap>
								<v-flex xs12>
									<h3>Connection setup</h3>
								</v-flex>
								<v-flex xs12>
									<v-text-field
											label="Server IP"
											v-model="config.server"
											:disabled="saving" />
								</v-flex>
								<v-flex xs12>
									<v-text-field
											label="User account"
											v-model="config.user"
											:disabled="saving" />
								</v-flex>
								<v-flex xs12>
									<v-text-field
											label="Password"
											v-model="config.password"
											:disabled="saving"
											:type="showPwd ? 'text' : 'password'"
											:append-icon="showPwd ? 'visibility_off' : 'visibility'"
											@click:append="showPwd = !showPwd" />
								</v-flex>
								<v-flex xs12 class="text-xs-right">
									<v-btn color="primary" v-text="'Save'" @click="save" :disabled="saving" />
								</v-flex>
							</v-layout>
						</v-card-title>
					</v-card>
				</v-flex>
			</v-layout>
		</v-container>
	</v-form>
</template>


<script lang="ts">
	import Vue from 'vue';
	import props from '../../application-properties';
	import sock from '../sock';

	export default Vue.extend ({
		name: 'setup',
		data () {
			return {
				showPwd: false,
				config: props.serverConfig,
				saving: false
			}
		},
		methods: {
			save () {
				this.saving = true;
				sock.once ('config:credentials', () => {
					this.saving = false;
				});
				sock.emit ('config:credentials', {
					server: this.config.server,
					user: this.config.user,
					password: this.config.password
				});
			}
		},
	});
</script>
