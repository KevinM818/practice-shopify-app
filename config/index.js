const env = process.env.NODE_ENV || 'development';
const production = require('./production');
const development = require('./development');

const config = {
	SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
	SHOPIFY_SHARED_SECRET: process.env.SHOPIFY_SHARED_SECRET,
	APP_NAME: 'Gigi Build a Set',
	APP_STORE_NAME: 'Gigi Build a Set',
	APP_SCOPE: 'read_products,write_products,read_orders,read_inventory,write_inventory',
	DATABASE_NAME: 'practice_app_db',
	WEBHOOKS: ['app/uninstalled','orders/create','collections/delete','collections/update','products/update','products/delete','products/create']
}

if (env === 'development') {
  module.exports = Object.assign({}, config, development);
} else {
  module.exports = Object.assign({}, config, production);
}

