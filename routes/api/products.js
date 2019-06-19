const express = require('express');
const Product = require('./../../models/product');
const Option = require('./../../models/option');
const Collection = require('./../../models/collection');

const router = express.Router();

router.get('/', async (req, res) => {
	try {
    const shopifyDomain = req.query.shop;
    let savedOption;
    let queryCollections;
    let getCollections;
    if (req.query.option == 'all_collections') {
      savedOption = await Collection.find({shopifyDomain}).exec();
      queryCollections = savedOption.map(coll => coll.collection_id);
      getCollections = savedOption;
    } else {
      savedOption = await Option.findOne({shopifyDomain, _id: req.query.option}).exec();
      queryCollections = savedOption.collections.map(coll => coll.collection_id);   
      getCollections = savedOption.collections; 
    }
    let findObj = {
      shopifyDomain,
      collection_ids: {$in: queryCollections},
      publishedAt: {$ne: null},
      inventory_quantity: {$gt: 0}
    };
    if (req.query.pattern) {
      findObj.tags = {$all: req.query.pattern.split(',')};
    }
    if (req.query.colors) {
      findObj.$or = [];
      req.query.colors.split(',').forEach(color => findObj.$or.push({
        tags: {$elemMatch: {$regex: color.trim(), $options: 'i'}}
      }));
    }
    const allProducts = await Product.find({shopifyDomain, collection_ids: {$in: queryCollections}, publishedAt: {$ne: null}, inventory_quantity: {$gt: 0}}).exec();
    const products = await Product.find(findObj).sort({created_at: -1}).exec();
    let filterArr = [];
    let data = [];
    getCollections.forEach(coll => data.push({
      title: coll.title,
      collection_id: coll.collection_id,
      order: req.query.option == 'all_collections' ? getAllCollectionsOrder(coll.title) : coll.order,
      products: products.filter(p => p.collection_ids.indexOf(coll.collection_id) > -1)
    }));
    data.forEach(opt => opt.products = opt.products.slice(0,7));
    data.sort((a,b) => a.order - b.order);
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
      publishedAt: {$ne: null},
      inventory_quantity: {$gt: 0}
    };
    if (req.query.pattern) {
      findObj.tags = {$all: req.query.pattern.split(',')};
    }
    if (req.query.colors) {
      findObj.$or = [];
      req.query.colors.split(',').forEach(color => findObj.$or.push({
        tags: {$elemMatch: {$regex: color.trim(), $options: 'i'}}
      }));
    }
    const products = await Product.find(findObj).sort({created_at: -1}).skip((page - 1) * pageSize).limit(pageSize).exec();
    res.send({products});
  } catch(e) {
    console.log('Error getting collection GET', e);
    res.status(400).send(e);
  }
});

const getAllCollectionsOrder = title => {
  let order;
  switch (title) {
    case 'Boy Newborn Sets':
      order = 1;
      break;
    case 'Girl Newborn Sets':
      order = 2;
      break;
    case 'Gowns':
      order = 3;
      break;
    case 'Swaddle Blankets':
      order = 4;
      break;
    case 'Sibling Shirts and Sets':
      order = 5;
      break;
    default:
      order = 999;
  }
  return order;
}

module.exports = router;