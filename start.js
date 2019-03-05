var mongoose = require('mongoose');
require('dotenv').config();

const config = require('../config');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || `mongodb://localhost:27017/${config.DATABASE_NAME}`);

const app = require('./app');
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`App running on port ${port}`));
