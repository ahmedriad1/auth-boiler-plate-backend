const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const handler = require('./errors/handler');
const AppError = require('./errors/AppError');

const app = express();
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());
app.use(cors());

app.use('/api/v1/auth', authRoutes);

app.use((req, res, next) => {
  next(new AppError('Not found !', 404));
});

app.use(handler);

module.exports = app;
