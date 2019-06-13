const express = require('express');
const Collection = require('./../../models/collection');
const Product = require('./../../models/product');
const Option = require('./../../models/option');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
    const shopifyDomain = req.query.shop;
    const savedOption = await Option.findOne({shopifyDomain, _id: req.query.option}).exec();
    console.log('query');
    console.log(savedOption);
    let queryCollections = savedOption.collections.map(coll => coll.collection_id);    
    let findObj = {
      shopifyDomain,
      collection_ids: {$in: queryCollections},
      publishedAt: {$ne: null},
      inventory_quantity: {$gt: 0}
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
    const allProducts = await Product.find({shopifyDomain, collection_ids: {$in: queryCollections}, publishedAt: {$ne: null}, inventory_quantity: {$gt: 0}}).exec();
    const products = await Product.find(findObj).exec();
    let filterArr = [];
    let data = [];
    savedOption.collections.forEach(coll => data.push({
      title: coll.title,
      collection_id: coll.collection_id,
      products: []
    }));
    products.forEach(prod => {
      let index = data.indexOf(data.find(d => prod.collection_ids.indexOf(d.collection_id) > -1));
      data[index].products.push(prod);
    });
    data.forEach(opt => opt.products = opt.products.slice(0,7));
    allProducts.forEach(prod => {
      prod.tags.forEach(tag => {
        if (tag.indexOf('pattern_') > -1) {
          filterArr.push(tag);
        }
      })
    });
    res.send({prodData: data, patternFilters: filterArr.filter((value, index, self) => self.indexOf(value) === index)});
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
      collection_ids: req.params.id,
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
    const products = await Product.find(findObj).skip((page - 1) * pageSize).limit(pageSize).exec();
    res.send({products});
  } catch(e) {
    console.log('Error getting collection GET', e);
    res.status(400).send(e);
  }
});

module.exports = router;