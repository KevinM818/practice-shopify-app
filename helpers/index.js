const ShopifyAPI = require('shopify-node-api');
const config = require('../config');
const crypto = require('crypto');

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

module.exports = {
	openSession,
	verifyOAuth
}