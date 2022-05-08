const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');

const { sequelize } = require('./models/model')

const app = express();
app.use(bodyParser.json());
app.use('/', routes);

app.set('sequelize', sequelize)
app.set('models', sequelize.models)

module.exports = app;
