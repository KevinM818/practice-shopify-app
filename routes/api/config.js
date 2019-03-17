const express = require('express');
const { auth } = require('./../../middleware/auth');
const AppConfig = require('./../../models/config');

const router = express.Router();

router.get('/', async (req, res) => {
 	try {
    let shopConfig = await AppConfig.findOne({shopifyDomain: req.query.shop}).exec();
    if (!shopConfig) {
      return res.status(404).send();
    }
    res.send({shopConfig});
 	} catch(e) {
    console.log('Error getting shop config GET', e);
    res.status(400).send(e);
 	}
});

router.patch('/', auth, async (req, res) => {
  try {
    let shopConfig = await AppConfig.findOneAndUpdate({shopifyDomain: req.header('shop')}, {$set: req.body}, {new: true}).exec();
    if (!shopConfig) {
      return res.status(404).send();
    }
    res.send({shopConfig});
  } catch(e) {
    console.log('Error getting shop config PATCH', e);
    res.status(400).send(e); 
  }
});

module.exports = router;