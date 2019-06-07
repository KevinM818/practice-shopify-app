const ShopifyAPI = require('shopify-node-api');
const Product = require('./../models/product');

const fetchProducts = (shopName, shop, page, allProducts = []) => {
	shop.get('/admin/products.json', {limit: 250, page}, (err, data, headers) => {
		if (err) {return console.log('Error fetching products', err);}
		allProducts = [...allProducts, ...data.products];
		if (data.products.length === 250) {
			fetchProducts(shopName, shop, page + 1, allProducts);
		} else {
			return saveProducts(shopName, allProducts);
		}
	});
}

const saveProducts = async (shopName, products) => {
	if (products.length <= 0) {return;}
	let popProduct = products.pop();
	try {
		let properties = getProperties(shopName, popProduct);
		let product = new Product(properties);
		await product.save();
		saveProducts(shopName, products);
	} catch(e) {console.log(`Error saving product ${popProduct.title}`, e);}
}

const getProperties = (shopName, product) => {
	return {
		shopifyDomain: shopName,
		product_id: product.id,
		variant_id: product.variants[0].id,
		title: product.title,
		img: product.image ? product.image.src : '',
		tags: product.tags.split(',').map(tag => tag.trim()),
		price: product.variants[0].price,
		publishedAt: product.published_at,
		inventory_quantity: product.variants[0].inventory_quantity
	};
}

// TODO: Write a function to index the collections for an indivual product for product update and create webhooks.

module.exports = {
	fetchProducts
}