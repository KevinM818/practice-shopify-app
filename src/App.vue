<template>
	<div class="appContainer">
		<navigation></navigation>
		<div class="appInnerWrapper">
			<dashboard></dashboard>
		</div>
	</div>
</template>

<script type="text/javascript">
	let Navigation = require('./components/Navigation.vue');
	let Dashboard = require('./components/Dashboard.vue');

	module.exports = {
		components: {
			Navigation,
			Dashboard
		}
	};
</script>