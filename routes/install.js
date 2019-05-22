const express = require('express');
const Shopify = require('shopify-node-api');
const nonce = require('nonce')();
const config = require('../config');
const Shop = require('../models/shop');
const AppConfig = require('../models/config');
const {openSession, buildWebhooks} = require('./../helpers/');

const router = express.Router();

router.get('/', async (req, res) => {
	const shopName = req.query.shop;
	const state = nonce();
	const shopAPI = new Shopify({
		shop: shopName,
		shopify_api_key: config.SHOPIFY_API_KEY,
		shopify_shared_secret: config.SHOPIFY_SHARED_SECRET,
		shopify_scope: config.APP_SCOPE,
		redirect_uri: `${config.APP_URI}/install/callback`,
		nonce: state
	});
  const redirectURI = shopAPI.buildAuthURL();
  try {
  	const shop = new Shop({shopifyDomain: shopName, nonce: state});
  	const appConfig = new AppConfig({shopifyDomain: shopName});
  	await shop.save();
  	await appConfig.save();
		res.redirect(redirectURI);
  } catch (e) {
  	console.log('Error installing on shop', e);
  	res.status(400).send(e);
  }
});

router.get('/callback', async (req, res) => {
	const params = req.query;
	try {
		let shop = await Shop.findOne({shopifyDomain: params.shop}).exec();
		const shopAPI = new Shopify({
			shop: params.shop,
			shopify_api_key: config.SHOPIFY_API_KEY,
			shopify_shared_secret: config.SHOPIFY_SHARED_SECRET,
			nonce: shop.nonce
		});
		shopAPI.exchange_temporary_token(params, async (err, data) => {
			if (err) {
				console.log('Error exchanging token on callback', e);
				return res.status(400).send(e);
			}
			try {
				shop.accessToken = data.access_token;
				await shop.save();
				await buildWebhooks(config.WEBHOOKS, openSession(shop));
        res.redirect(`https://${shop.shopifyDomain}/admin/apps/`);
			} catch (e) {
				console.log('Error updating shop after getting token after callback', e);
  			res.status(400).send(e);
			}
		});
	} catch (e) {
		console.log('Error getting shop on callback', e);
  	res.status(400).send(e);
	}
});

module.exports = router;