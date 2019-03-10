const express = require('express');
var path = require('path');

const index = require('./routes/index');
const install = require('./routes/install');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/install', install);

module.exports = app;