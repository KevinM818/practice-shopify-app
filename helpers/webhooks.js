const Shop = require('./../models/shop');
const Product = require('./../models/product');
const Collection = require('./../models/collection');
const BuildSet = require('./../models/builtSet');
const {openSession} = require('./index');

const productUpdate = (product, shopName) => {
	console.log('PRODUCT UPDATE');
	console.log(shopName);
	console.log(product);
}

const orderCreate = async (items, shopifyDomain) => {
	let sets = items.line_items.filter(prod => prod.name === 'Built Set');
	if (sets.length === 0) {return;}
	let setsToDelete = [];
	let itemsToUpdate = [];
	sets.forEach(set => setsToDelete.push(set.product_id));
	try {
		let shop = await Shop.findOne({shopifyDomain}).exec();
		let savedSets = await BuildSet.find({shopifyDomain, orderConfirmed: false, product_id: {$in: setsToDelete}}).exec();
		let shopify = openSession(shop);
		savedSets.forEach(s => s.contents.forEach(item => itemsToUpdate.push({id: item.inventory_item_id, quantity: item.quantity})));
		deleteSets(setsToDelete, shopifyDomain, shopify);
		shopify.get('/admin/api/2019-04/locations.json', {}, (err, data, headers) => {
			if (err) {return console.log('Error getting location', e);}
			updateProductInventory(itemsToUpdate, data.locations[0].id, shopify);
		});
	} catch(e) {console.log('Error getting sets', e);}
}

const deleteSets = (ids, shopifyDomain, shop) => {
	if (ids.length <= 0) {return;}
	let id = ids.pop();
	shop.delete(`/admin/api/2019-04/products/${id}.json`, async (err, data, headers) => {
		if (err) {return console.log('Error deleting set', err);}
		try {
			await BuildSet.findOneAndUpdate({shopifyDomain, orderConfirmed: false, product_id: id}, {$set: {orderConfirmed: true}}).exec();
			deleteSets(ids, shopifyDomain, shop);
		} catch(e) {console.log('Error updating set', e);}
	});
}

const updateProductInventory = (items, locationId, shop) => {
	if (items.length <= 0) {return;}
	let id = items.pop();

	console.log(locationId);
	console.log(items);
}


module.exports = {
	productUpdate,
	orderCreate
};