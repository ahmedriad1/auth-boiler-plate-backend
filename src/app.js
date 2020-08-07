const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

module.exports = app;
