const express = require('express');
const AppConfig = require('./../../models/config');
const Option = require('./../../models/option');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const shopConfig = await AppConfig.findOne({shopifyDomain: req.query.shop}).exec();
    const shopOptions = await Option.find({shopifyDomain: req.query.shop}).exec();
    if (!shopConfig || !shopOptions) {
      return res.status(404).send();
    }
    const options = shopOptions.map(opt => {return {
      _id: opt._id,
      title: opt.title,
      collections: opt.collections
    }});
    let colors = {};
    shopOptions.forEach(opt => {
      opt.colors.forEach(color => {
        let colorVal = color.title.trim();
        if (colors.hasOwnProperty(colorVal)) {
          colors[colorVal].collections.push(opt.title);
        } else {
          colors[colorVal] = {
            collections: [opt.title],
            value: color.value
          }
        }
      });
    })
    res.send({shopConfig, options, colors});
  } catch(e) {
    console.log('Error getting app load');
    res.status(400).send(e);
  }
});

module.exports = router;