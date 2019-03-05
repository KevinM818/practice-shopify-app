const express = require('express');

const index = require('./routes/index');
const install = require('./routes/install');

const app = express();

app.use('/', index);
app.use('/install', install);

module.exports = app;