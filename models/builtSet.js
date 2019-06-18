const mongoose = require('mongoose');

const Content = new mongoose.Schema({
	title: String,
	inventory_item_id: Number,
	quantity: Number
})

const BuiltSet = new mongoose.Schema({
	shopId: Number,
	shopifyDomain: String,
	product_id: Number,
	variant_id: Number,
	contents: [Content],
	price: String,
	message: String,
	addBag: Boolean,
	created: Date,
	orderConfirmed: Boolean,
	orderCreated: Date
});

module.exports = mongoose.model('BuiltSet', BuiltSet);