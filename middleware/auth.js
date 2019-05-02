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

module.exports = {auth}