const express = require('express');
const AppConfig = require('./../../models/config');
const Option = require('./../../models/option');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const shopConfig = await AppConfig.findOne({shopifyDomain: req.query.shop}).exec();
    const options = await Option.find({shopifyDomain: req.query.shop}).exec();
    if (!shopConfig || !options) {
      return res.status(404).send();
    }
    res.send({shopConfig, options});
  } catch(e) {
    console.log('Error getting app load');
    res.status(400).send(e);
  }
});

module.exports = router;