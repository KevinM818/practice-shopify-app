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

const getCollectionProperties = (shopifyDomain, collection) => {
  return {
    shopifyDomain,
    collection_id: collection.id,
    title: collection.title,
    disjunctive: collection.disjunctive,
    rules: collection.rules
  };
}

const saveCollections = async (collections, shopifyDomain) => {
  if (collections.length <= 0) {return;}
  let popCollection = collections.pop();
  try {
    let properties = getCollectionProperties(shopifyDomain, popCollection);
    let collection = new Collection(properties);
    await collection.save();
    await indexProducts(collection, shopifyDomain);
    saveCollections(collections, shopifyDomain);
  } catch(e) {console.log(`Error saving collection ${popCollection.title}`, e);}
}

const indexProducts = async (collection, shopifyDomain) => {
  try {
    let removeCollection = [];
    let addCollection = [];
    let collId = collection.collection_id;
    let query = getRuleQuery(collection.disjunctive, collection.rules);
    query.shopifyDomain = shopifyDomain;
    const currentProducts = await Product.find({shopifyDomain, collection_ids: collId}).exec();
    const newProducts = await Product.find(query).exec();
    currentProducts.forEach(prod => {
      if (newProducts.indexOf(prod) == -1) {
        removeCollection.push(prod);
      }
    });  
    addCollection = newProducts.filter(prod => prod.collection_ids.indexOf(collId) == -1);
    if (removeCollection.length > 0) {
      editCollectionIds(removeCollection, true, collId, shopifyDomain);
    } 
    if (addCollection.length > 0) {
      editCollectionIds(addCollection, false, collId, shopifyDomain);
    }
  } catch(e) {console.log('Error indexing products', e);}
}

const editCollectionIds = async (products, remove, id, shopifyDomain) => {
  if (products.length <= 0) {return;}
  let product = products.pop();
  prodCollArr = product.collection_ids;
  if (remove) {
    prodCollArr.splice(prodCollArr.indexOf(id), 1);
  } else {
    prodCollArr.push(id);
  }
  try {
    await Product.findOneAndUpdate({shopifyDomain, product_id: product.product_id}, {$set: {collection_ids: prodCollArr}});
    editCollectionIds(products, remove, id, shopifyDomain);
  } catch(e) {console.log(`Error editing product collection ids ${product.title}`, e);}
}

const getRuleQuery = (disjunctive, rules) => {
  let query = [];
  rules.forEach(rule => query.push(getField(rule)));
  return disjunctive ? {$or: query} : {$and: query};
}

const getField = rule => {
  let obj;
  switch (rule.column) {
    case 'tag':
      obj = {tags: getCondition(rule.relation, rule.condition)};
      break;
    case 'title':
      obj = {title: getCondition(rule.relation, rule.condition)};
      break;
    case 'variant_price':
      obj = {price: getCondition(rule.relation, rule.condition)};
      break;
    case 'variant_inventory':
      obj = {inventory_quantity: getCondition(rule.relation, rule.condition)};
      break;
  }
  return obj;
}

const getCondition = (relation, condition) => {
  let val;
  switch (relation) {
    case 'equals':
      val = condition;
      break;
    case 'greater_than':
      val = {$gt: condition};
      break;
    case 'less_than':
      val = {$lt: condition};
      break;
  }
  return val;
}

const deleteCollections = async (collections, shopifyDomain) => {
  try {
    await Collection.deleteMany({shopifyDomain, collection_id: {$in: collections}}).exec();
    collections.forEach(async coll => {
      try {
        let products = await Product.find({shopifyDomain, collection_ids: coll}).exec();
        await editCollectionIds(products, true, coll, shopifyDomain);
      } catch (e) {console.log('Error getting products in delete collections', e);}
    });
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