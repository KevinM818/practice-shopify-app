const express = require('express');

const Shop = require('./../models/shop');

const router = express.Router();

router.get('/', async (req, res) => {
  const query = Object.keys(req.query).map((key) => `${key}=${req.query[key]}`).join('&');
  
  if (!req.query.shop) {
		return res.send('Missing shop parameter. Please add ?shop=your-development-shop to your request');
  }

  try {
  	const shop = await Shop.findOne({shopifyDomain: req.query.shop});
  	if (!shop) {
    	return res.redirect(`/install/?${query}`);
  	}

  	res.send('Hello Success, verify now');

  } catch (e) {
  	console.log('Error finding shop in index', e);
  	res.status(400).send(e);
  }

});

module.exports = router;