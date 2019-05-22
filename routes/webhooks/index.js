const express = require('express');
const {verifyWebhook} = require('./../../middleware/auth');

const router = express.Router();

router.post('/', verifyWebhook, (req, res) => {
	res.sendStatus(200);
	console.log(req.shop);
	console.log(req.topic);
	console.log(req.body);
});

module.exports = router;