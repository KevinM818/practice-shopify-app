const config = require('../config');
const crypto = require('crypto');
const Shop = require('./../models/shop');

const auth = async (req, res, next) => {
  const hmac = req.header('hmac');
  const shop = req.header('shop');

	console.log('server msg');
  console.log(`HMAC: ${hmac}`);
  console.log(`SHOP: ${shop}`);
	next();
};

module.exports = {auth}