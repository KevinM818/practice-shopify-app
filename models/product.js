const mongoose = require('mongoose');

const Product = new mongoose.Schema({
	shopId: Number,
	shopifyDomain: String,
	product_id: Number,
	variant_id: Number,
	collection_id: Number,
	title: String,
	img: String,
	price: mongoose.Decimal128
});