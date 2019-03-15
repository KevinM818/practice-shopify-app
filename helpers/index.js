const ShopifyAPI = require('shopify-node-api');
const config = require('../config');
const crypto = require('crypto');
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
      }))
      saveCollections(newCollections);
    }
  } catch(e) {
    console.log('Error updating collections', e);
  }
}

const saveCollections = async (collections) => {
  if (collections.length <= 0) {
    return;
  }
  try {
    let collection = collections.pop();
    await collection.save();
    saveCollections(collections);
  } catch(e) {
    console.log(`Error saving collection ${collection.title}`, e);
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



module.exports = {
	openSession,
	verifyOAuth,
  checkCollections
}