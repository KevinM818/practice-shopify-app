const express = require('express');
const {verifyWebhook} = require('./../../middleware/auth');
const {productUpdate, orderCreate} = require('./../../helpers/webhooks');

const router = express.Router();

router.post('/', verifyWebhook, (req, res) => {
	res.sendStatus(200);
	if (req.topic == 'products/update') {
		productUpdate(req.body, req.shop);
	} else if (req.topic == 'orders/create') {
		orderCreate(req.body, req.shop);
	}
	
	// app/uninstalled
	
	// orders/create
	// - If order has a Node Built type update inventory for each item, and delete node built prod

	// collections/delete
	// - delete from collections, find products with collection id and remove from array

	// collections/update
	// - overwrite collection and reindex products

	// products/update
	// - overwrite product and reindex collection 

	// products/delete
	// - unless type equals node built delete product

	// products/create
	// - unless type equals node built create product and index it

});

module.exports = router;