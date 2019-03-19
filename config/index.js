const env = process.env.NODE_ENV || 'development';
const production = require('./production');
const development = require('./development');

const config = {
	SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
	SHOPIFY_SHARED_SECRET: process.env.SHOPIFY_SHARED_SECRET,
	APP_NAME: 'Gigi Build a Set',
	APP_STORE_NAME: 'Gigi Build a Set',
	APP_SCOPE: 'read_products,write_products,read_inventory,write_inventory,read_checkouts,write_checkouts',
	DATABASE_NAME: 'practice_app_db'
}

if (env === 'development') {
  module.exports = Object.assign({}, config, development);
} else {
  module.exports = Object.assign({}, config, production);
}