const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const index = require('./routes/index');
const install = require('./routes/install');
const load = require('./routes/api/load');
const configApi = require('./routes/api/config');
const optionsApi = require('./routes/api/options');
const productsApi = require('./routes/api/products');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/install', install);
app.use('/load', load);
app.use('/config', configApi);
app.use('/option', optionsApi);
app.use('/products', productsApi);

module.exports = app;