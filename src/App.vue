<template>
	<div class="appContainer">
		<navigation></navigation>
		<div class="appInnerWrapper">
			<dashboard></dashboard>
		</div>
		<button @click="getConfig()">Test get config</button>
	</div>
</template>

<script type="text/javascript">
	const Navigation = require('./components/Navigation.vue');
	const Dashboard = require('./components/Dashboard.vue');
	const { getData } = require('./utils/utils.js');

	module.exports = {
		components: {
			Navigation,
			Dashboard
		},
		methods: {
			getConfig() {
				getData('/config', (res) => {
					console.log('success', res);
				})
			}
		}
	};
</script>