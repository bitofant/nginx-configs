<style lang="scss" scoped>
	
</style>


<template>
	<v-container fluid>
		<v-btn color="primary" @click="generate">Generate bash script</v-btn>
		<v-btn color="error" @click="execute">Execute bash script</v-btn>
		<!-- <v-textarea v-model="script" box style="font-family: monospace" :rows="script.split ('\n').length" label="Generated Script" /> -->
		<v-layout v-if="stdout||stderr" row>
			<v-flex v-if="stdout" :xs6="stderr" ma-2 py-1 px-2 class="elevation-2" style="background:#fff">
				<pre style="overflow:auto" v-text="stdout" />
			</v-flex>
			<v-flex v-if="stderr" :xs6="stdout" ma-2 py-1 px-2 class="elevation-2" style="background:#fff">
				<pre style="overflow:auto;color:#c00" v-text="stderr" />
			</v-flex>
		</v-layout>
		<div v-else style="overflow: auto">
			<pre v-text="script" />
		</div>
	</v-container>
</template>


<script lang="ts">
	import Vue from 'vue';
	import { sock } from '../sock';
	
	export default Vue.extend ({
		name: 'executor',
		data () {
			return {
				script: '(not yet generated)',
				stdout: '',
				stderr: ''
			}
		},
		methods: {
			generate () {
				this.stdout = this.stderr = '';
				this.script = 'generating...';
				sock.emit ('script:generate');
			},
			execute () {
				this.stdout = 'Execution started...';
				this.stderr = '';
				sock.emit ('script:execute');
			},
			onScriptGenerated (script : string) {
				this.script = script;
			},
			onScriptExecuted (result : { stdout : string, stderr : string }) {
				this.stdout = result.stdout;
				this.stderr = result.stderr;
			}
		},
		created () {
			sock.on ('script:generated', this.onScriptGenerated);
			sock.on ('script:executed', this.onScriptExecuted);
		},
		beforeDestroy () {
			sock.removeListener ('script:generated', this.onScriptGenerated);
			sock.removeListener ('script:executed', this.onScriptExecuted);
		}
	});
</script>
