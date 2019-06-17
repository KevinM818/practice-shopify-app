const Shop = require('./../models/shop');
const Product = require('./../models/product');
const Collection = require('./../models/collection');
const {openSession} = require('./index');

const productUpdate = (product, shopName) => {
	console.log('PRODUCT UPDATE');
	console.log(shopName);
	console.log(product);
}

const orderCreate = (items, shopName) => {
	let sets = items.line_items.filter(prod => prod.name === 'Built Set');
	if (sets.length === 0) {return;}
	console.log('HAS SET');
	console.log(shopName);
	console.log(sets);
}

module.exports = {
	productUpdate,
	orderCreate
};