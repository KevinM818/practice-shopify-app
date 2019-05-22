const config = require('../config');
const crypto = require('crypto');
const Shop = require('./../models/shop');

const auth = (req, res, next) => {
  const hmac = req.header('hmac');
  const locale = req.header('locale');
  const shop = req.header('shop');
  const timestamp = req.header('timestamp');
  const query = {shop, locale, timestamp};
  if (!hmac) {
  	return res.status(400).send();
  }
  const sortedQuery = Object.keys(query).map(key => `${key}=${Array(query[key]).join(',')}`).sort().join('&');
  const calculatedSignature = crypto.createHmac('sha256', config.SHOPIFY_SHARED_SECRET).update(sortedQuery).digest('hex');
  if (calculatedSignature === hmac) {
    next();
  } else {
    res.status(400).send(); 
  }
};

const verifyWebhook = (req, res, next) => {
  let hmac;
  let data;
  try {
    hmac = req.get('X-Shopify-Hmac-Sha256');
    data = req.body;
  } catch(e) {
    res.sendStatus(200);
  }
  if (verifyHmac(data, hmac)) {
    req.topic = req.get('X-Shopify-Topic');
    req.shop = req.get('X-Shopify-Shop-Domain');
    req.body = JSON.parse(req.body);
    return next();
  }
  return res.sendStatus(200);
}

const verifyHmac = (data, hmac) => {
  if (!hmac || !data) {
    return false;
  } 
  const sharedSecret = config.SHOPIFY_SHARED_SECRET;
  const calculatedSignature = crypto.createHmac('sha256', sharedSecret).update(data, 'utf8', 'hex').digest('base64');
  return calculatedSignature === hmac;
}


module.exports = {
  auth,
  verifyWebhook
}