const express = require('express');

const config = require('./../config/');
const { verifyOAuth } = require('./../helpers/');
const Shop = require('./../models/shop');

const router = express.Router();

router.get('/', async (req, res) => {
  const query = Object.keys(req.query).map((key) => `${key}=${req.query[key]}`).join('&');
  const queryHmac = req.query.hmac;

  if (!req.query.shop) {
		return res.send('Missing shop parameter. Please add ?shop=your-development-shop to your request');
  }

  try {
  	const shop = await Shop.findOne({shopifyDomain: req.query.shop});
  	if (!shop) {
    	return res.redirect(`/install/?${query}`);
  	}

    if (verifyOAuth(req.query)) {
      res.setHeader('X-Shopify-Shop-Domain', shop.shopifyDomain);
      res.setHeader('X-Shopify-Hmac', queryHmac);

    	return res.render('index', {
        title: config.APP_NAME,
        apiKey: config.SHOPIFY_API_KEY,
        shopOrigin: shop.shopifyDomain
      });
    }

  } catch (e) {
  	console.log('Error finding shop in index', e);
  	res.status(400).send(e);
  }

});

module.exports = router;