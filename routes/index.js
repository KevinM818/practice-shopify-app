const express = require('express');

const Shop = require('./../models/shop');

const router = express.Router();

router.get('/', async (req, res) => {
  const query = Object.keys(req.query).map((key) => `${key}=${req.query[key]}`).join('&');
  console.log(query);
  if (!req.query.shop) {
		return res.send('Missing shop parameter. Please add ?shop=your-development-shop to your request');
  }

  try {
  	const shop = await Shop.findOne({shopifyDomain: req.query.shop});
  	if (!shop) {
    	return res.redirect(`/install/?${query}`);
  	}

  	return res.render('index.html');

  } catch (e) {
  	console.log('Error finding shop in index', e);
  	res.status(400).send(e);
  }

});

module.exports = router;