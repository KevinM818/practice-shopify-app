require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');

const config = require('./config/');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || `mongodb://localhost:27017/${config.DATABASE_NAME}`, {useNewUrlParser: true});

const app = require('./app');
const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port, () => console.log(`App running on port ${port}`));
