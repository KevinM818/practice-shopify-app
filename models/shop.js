const mongoose = require('mongoose');

const Shop = new mongoose.Schema({
	shopId: Number,
	name: String,
	shopifyDomain: String,
	domain: String,
	supportEmail: String,
	nonce: String,
	accessToken: String
});

module.exports = mongoose.model('Shop', Shop);