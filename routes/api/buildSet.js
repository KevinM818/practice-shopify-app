const express = require('express');
const Shop = require('./../../models/shop');
const BuildSet = require('./../../models/builtSet');
const {openSession} = require('./../../helpers/');

const router = express.Router();

router.post('/', async (req, res) => {
	try {
		const shop = await Shop.findOne({shopifyDomain: req.header('shop')}).exec();
    let productData = {
      product: {
        title: 'Built Set',
        product_type: 'Node Built',
        images: [{
          src: 'https://cdn.shopify.com/s/files/1/1120/6812/files/Gift_Box.png?5644'
        }],
        variants: [{
          option1: 'Default Title',
          price: req.body.price
        }]
      }
    };
		openSession(shop).post('/admin/products.json', productData, async (err, data, headers) => {
      try {
        const buildSet = new BuildSet({
          shopifyDomain: req.header('shop'),
          product_id: data.product.id,
          variant_id: data.product.variants[0].id,
          contents: req.body.contents,
          price: req.body.price,
          message: req.body.message,
          blankMessage: req.body.blankMessage,
          created: new Date(),
          orderConfirmed: false
        });
        await buildSet.save();
        res.send({idToAdd: data.product.variants[0].id});
      } catch(e) {
        res.status(400).send('Error saving set', e);
      }
		});
	} catch(e) {
		res.status(400).send('Error building set', e);
	}
});

router.get('/', async (req, res) => {
  try {
    let sets = await BuildSet.find({shopifyDomain: req.query.shop}).exec();
    res.send({sets});
  } catch(e) {
    res.status(400).send('Error getting sets', e);
  }
});

module.exports = router;