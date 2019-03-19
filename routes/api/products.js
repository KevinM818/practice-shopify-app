const express = require('express');
const Collection = require('./../../models/collection');
const Product = require('./../../models/product');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
    const query = req.query.collections.split(',');
    const queryCollections = query.map(id => parseInt(id));
    const collections = await Collection.find({shopifyDomain: req.query.shop, collection_id: queryCollections}).exec();
    let findObj = {
      shopifyDomain: req.query.shop,
      collection_id: {$in: queryCollections},
      publishedAt: {$ne: null}
    };
    if (req.query.pattern || req.query.colors) {
      findObj.$and = [];
    }
    if (req.query.pattern) {
      findObj.$and.push({tags: {$all: req.query.pattern.split(',')}})
    }
    if (req.query.colors) {
      findObj.$and.push({tags: {$in: req.query.colors.split(',')}})
    }
    const products = await Product.find(findObj).exec();
    let data = [];
    collections.forEach(coll => data.push({
      title: coll.title,
      collection_id: coll.collection_id,
      products: []
    }));
    products.forEach(prod => {
      let index = data.indexOf(data.find(opt => opt.collection_id == prod.collection_id));
      data[index].products.push(prod);
    });
    data.forEach(opt => opt.products = opt.products.slice(0,7));
    res.send(data);
	} catch(e) {
		console.log('Error getting products GET', e);
    res.status(400).send(e);
	}
});

router.get('/:id', async (req, res) => {
  try {
    let pageSize = 7;
    let page = parseInt(req.query.page) || 1;
    let findObj = {
      shopifyDomain: req.query.shop,
      collection_id: req.params.id
    };
    if (req.query.pattern || req.query.colors) {
      findObj.$and = [];
    }
    if (req.query.pattern) {
      findObj.$and.push({tags: {$all: req.query.pattern.split(',')}})
    }
    if (req.query.colors) {
      findObj.$and.push({tags: {$in: req.query.colors.split(',')}})
    }
    const products = await Product.find(findObj).skip((page - 1) * pageSize).limit(pageSize).exec();
    res.send({products});
  } catch(e) {
    console.log('Error getting collection GET', e);
    res.status(400).send(e);
  }
});

module.exports = router;