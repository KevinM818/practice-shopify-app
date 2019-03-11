const mongoose = require('mongoose');

const Config = new mongoose.Schema({
	shopId: Number,
	shopifyDomain: String,
	title: {type: String, default: 'Build a Box'},
	discountPercentage: {type: Number, default: 10},
	selectOptionText: {type: String, default: 'Select option'},
	selectColorText: {type: String, default: 'Select colors'},
	selectItemsText: {type: String, default: 'Select 3 to 5 items'},
	stepOneTitle: {type: String, default: 'Select option and colors'},
	stepTwoTitle: {type: String, default: 'Select items'},
	stepThreeTitle: {type: String, default: 'Add message'},
	confirmTitle: {type: String, default: 'Confirm'},
	stepOneText: {type: String, default: 'Create a set'},
	stepTwoText: {type: String, default: 'Select from these items'},
	stepThreeText: {type: String, default: 'Write a message'},
	comfirmText: {type: String, default: 'Added to cart'}
});

module.exports = mongoose.model('Config', Config);
