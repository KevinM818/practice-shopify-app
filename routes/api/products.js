const express = require('express');
const Collection = require('./../../models/collection');
const Product = require('./../../models/product');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
    const query = req.query.collections.split(',');
    const queryCollections = query.map(id => parseInt(id));
    const collections = await Collection.find({shopifyDomain: req.query.shop, collection_id: queryCollections}).exec();
    const products = await Product.find({shopifyDomain: req.query.shop, collection_id: {$in: queryCollections}}).exec();
    let data = [];
    collections.forEach(coll => data.push({
      title: coll.title,
      collection_id: coll.collection_id,
      products: []
    }));

    res.send(data);
	} catch(e) {
		console.log('Error getting products GET', e);
    res.status(400).send(e);
	}
});

router.get('/:id', async (req, res) => {
  try {
    const products = await Product.find({shopifyDomain: req.query.shop, collection_id: req.params.id}).exec();
    res.send({products});
  } catch(e) {
    console.log('Error getting collection GET', e);
    res.status(400).send(e);
  }
});

module.exports = router;