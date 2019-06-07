const ShopifyAPI = require('shopify-node-api');
const config = require('../config');
const crypto = require('crypto');
const Shop = require('./../models/shop');
const Option = require('./../models/option');
const Product = require('./../models/product');
const Collection = require('./../models/collection');

const openSession = shop => {
	return new ShopifyAPI({
		shop: shop.shopifyDomain,
		shopify_api_key: config.SHOPIFY_API_KEY,
		shopify_shared_secret: config.SHOPIFY_SHARED_SECRET,
		access_token: shop.accessToken
	});
}

const verifyOAuth = query => {
	if (!query.hmac) {
		return false;
	}
	const hmac = query.hmac; 
	delete query.hmac;
  const sortedQuery = Object.keys(query).map(key => `${key}=${Array(query[key]).join(',')}`).sort().join('&');
  const calculatedSignature = crypto.createHmac('sha256', config.SHOPIFY_SHARED_SECRET).update(sortedQuery).digest('hex');
  if (calculatedSignature === hmac) {
  	return true;
  }
  return false;
}

const checkCollections = async shopifyDomain => {
  try {
    let savedOptionCollections = [];
    let collectionsToSave = [];
    let collectionsToDelete = [];
    const options = await Option.find({shopifyDomain}).exec();
    const savedCollections = await Collection.find({shopifyDomain}).exec();
    options.map(opt => opt.collections.forEach((coll) => savedOptionCollections.push(coll)));
    savedCollections.forEach(coll => {
      if (!savedOptionCollections.find(c => c.collection_id === coll.collection_id)) {
        collectionsToDelete.push(coll.collection_id);
      }
    });
    savedOptionCollections.forEach(coll => {
      if (!savedCollections.find(c => c.collection_id === coll.collection_id)) {
        collectionsToSave.push(coll);
      }
    });
    if (collectionsToDelete.length > 0) {
      deleteCollectionsAndProducts(collectionsToDelete, shopifyDomain);
    }
    if (collectionsToSave.length > 0) {
      let newCollections = collectionsToSave.map(coll => new Collection({
        shopifyDomain,
        collection_id: coll.collection_id,
        title: coll.title  
      }));
      saveCollections(newCollections);
    }
  } catch(e) {
    console.log('Error updating collections', e);
  }
}

const saveCollections = async collections => {
  if (collections.length <= 0) {
    return;
  }
  try {
    let collection = collections.pop();
    await collection.save();
    getProducts(collection.collection_id, collection.shopifyDomain);
    saveCollections(collections);
  } catch(e) {
    console.log(`Error saving collection ${collection.title}`, e);
  }
}

// TODO: Function to index products for an individual collection, mabye include in saveCollections

const getProducts = async (collection_id, shopifyDomain) => {
  try {
    const shop = await Shop.findOne({shopifyDomain}).exec();
    openSession(shop).get('/admin/products.json', {collection_id, limit: 250}, (err, data, headers) => {
      if (err) {
        return Promise.reject(err);
      }
      let newProducts = [];
      data.products.forEach(prod => {
        let img = '';
        if (prod.image) {
          img = prod.image.src;
        }
        newProducts.push(new Product({
          shopifyDomain,
          product_id: prod.id,
          variant_id: prod.variants[0].id,
          collection_id: collection_id,
          title: prod.title,
          img,
          tags: prod.tags.split(',').map(tag => tag.trim()),
          price: prod.variants[0].price,
          publishedAt: prod.published_at,
          inventory_quantity: prod.variants[0].inventory_quantity
        }));
      })
      saveProducts(newProducts);
    })
  } catch(e) {
    console.log('Error getting products', e)
  }
}

const saveProducts = async products => {
  if (products.length <= 0) {
    return;
  }
  try {
    let product = products.pop();
    await product.save();
    saveProducts(products);
  } catch(e) {
    console.log(`Error saving product ${product.title}`, e);
  }
}

const deleteCollectionsAndProducts = async (collections, shopifyDomain) => {
  try {
    await Collection.deleteMany({shopifyDomain, collection_id: {$in: collections}}).exec();
    await Product.deleteMany({shopifyDomain, collection_id: {$in: collections}}).exec();
  } catch(e) {
    console.log('Error deleting collections or products', e);
  }
}

const buildWebhooks = (webhooks, shop) => {
  if (webhooks.length <= 0) {return;}
  let webhookTopic = webhooks.pop();
  let data = {webhook: {
    topic: webhookTopic,
    address: `${config.APP_URI}/webhook/`,
    format: 'json'
  }};
  shop.post('/admin/webhooks.json', data, (err, res, headers) => {
    if (err) {
      return console.log(`Error installing ${webhookTopic} webhook`, err);
    }
    buildWebhooks(webhooks, shop);
  });
}

module.exports = {
	openSession,
	verifyOAuth,
  checkCollections,
  buildWebhooks
}