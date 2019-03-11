const mongoose = require('mongoose');

const Collection = new mongoose.Schema({
	collection_id: Number,
	title: String
});

const Color = new mongoose.Schema({
	title: String,
	value: String
});

const Option = new mongoose.Schema({
	shopId: Number,
	shopifyDomain: String,
	title: String,
	collections: [Collection],
	colors: [Color]
});

module.exports = mongoose.model('Option', Option);