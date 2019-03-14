const express = require('express');
const { auth } = require('./../../middleware/auth');

const router = express.Router();

router.get('/', auth, (req, res) => {
  res.send('user config here');
});

module.exports = router;