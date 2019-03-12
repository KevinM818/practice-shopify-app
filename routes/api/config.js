const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  console.log('test');
  console.log(req.get('X-Shopify-Domain'));
  res.send('user config here');
});

module.exports = router;