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
        collectionsToSave.push(coll.collection_id);
      }
    });
    if (collectionsToDelete.length > 0) {
      deleteCollections(collectionsToDelete, shopifyDomain);
    }
    if (collectionsToSave.length > 0) {
      let shop = await Shop.findOne({shopifyDomain}).exec();
      openSession(shop).get('/admin/api/2019-04/smart_collections.json', {ids: collectionsToSave.join(',')}, (err, data, headers) => {
        if (err) {return console.log(`Error getting collections`, err);}
        saveCollections(data.smart_collections, shopifyDomain);
      });


    }
  } catch(e) {
    console.log('Error updating collections', e);
  }
}

const saveCollections = (collections, shopifyDomain) => {
  console.log(shopifyDomain);
  console.log(collections);
}

const indexProducts = (collections) => {

}

const deleteCollections = async (collections, shopifyDomain) => {
  try {
    await Collection.deleteMany({shopifyDomain, collection_id: {$in: collections}}).exec();
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