<template>
	<div class="BuiltSets">
		<h1>Built Sets</h1>
    	<div class="spinner" v-if="loading">loading...</div>
			<div v-else>
				<ul>
					<li v-for="set in sets" class="BuiltSets__set">
						<div class="infoLeft">
							<p><b>ID:</b> {{ set.product_id }}</p>
							<p><b>Price:</b> ${{ set.price }}</p>
							<p><b>Created At: </b> {{ set.created }}</p>
							<p><b>Order Confirmed:</b> {{ set.orderConfirmed }}</p>
							<p v-if="set.addBag">Added Bag</p>
						</div>
						<div class="infoRight">
							<p><b>Contents:</b></p>
							<p v-for="item in set.contents">{{ item.title }} X {{ item.quantity }}</p>
							<p v-if="set.message"><b>Message:</b> {{ set.message }}</p>
						</div>
					</li>
				</ul>
			</div>
	</div>
</template>

<script type="text/javascript">
  const {getData} = require('./../utils/utils.js');

	module.exports = {
		data() {
			return {
				loading: true,
				sets: []
			}
		},
		methods: {
			loadSets(res) {
				console.log(res);
				this.sets = res.data.sets;
				this.loading = false;
			}
		},
		created() {
			getData('/build-set', this.loadSets);
		}
	};
</script>