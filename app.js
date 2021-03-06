const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const index = require('./routes/index');
const install = require('./routes/install');
const load = require('./routes/api/load');
const configApi = require('./routes/api/config');
const optionsApi = require('./routes/api/options');
const productsApi = require('./routes/api/products');
const buildSetsApi = require('./routes/api/buildSet');
const webhooks = require('./routes/webhooks/index');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/install', install);
app.use('/load', load);
app.use('/config', configApi);
app.use('/option', optionsApi);
app.use('/products', productsApi);
app.use('/build-set', buildSetsApi);
app.use('/webhook', webhooks);

module.exports = app;