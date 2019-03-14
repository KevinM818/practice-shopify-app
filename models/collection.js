const mongoose = require('mongoose');

const Collection = new mongoose.Schema({
	shopId: Number,
	shopifyDomain: String,
	collection_id: Number,
	title: String
});

module.exports = mongoose.model('Collection', Collection);