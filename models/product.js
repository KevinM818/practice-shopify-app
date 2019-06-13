const mongoose = require('mongoose');

const Product = new mongoose.Schema({
	shopId: Number,
	shopifyDomain: String,
	product_id: Number,
	variant_id: Number,
	collection_ids: [Number],
	title: String,
	img: String,
	tags: [String],
	price: mongoose.Decimal128,
	publishedAt: Date,
	created_at: Date,
	inventory_quantity: Number
});

module.exports = mongoose.model('Product', Product);