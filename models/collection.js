const mongoose = require('mongoose');

const Rule = {
	column: String,
	relation: String,
	condition: String,
};

const Collection = new mongoose.Schema({
	shopId: Number,
	shopifyDomain: String,
	collection_id: Number,
	title: String,
	disjunctive: Boolean,
	rules: [Rule]
});

module.exports = mongoose.model('Collection', Collection);