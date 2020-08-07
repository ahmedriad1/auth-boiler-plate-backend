/* eslint-disable prefer-destructuring */
/* eslint-disable no-console */
const ValidationError = require('mongoose').Error.ValidationError;
const AppError = require('./AppError');

const sendProductionError = (err, req, res) => {
  res.status(err.statusCode || 500);
  const message = err.isOperational ? err.message : 'Something went wrong !';
  if (!err.isOperational) console.error(`Error: ${err}`);
  res.json({
    message,
  });
};

const sendDevelopmentError = (err, res, req) => {
  res.json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const handleCastError = err => new AppError(`Invalid ${err.path}: ${err.value} !`, 400);

const handleDuplicateKeyError = err => {
  const duplicateValue = err.keyValue[Object.keys(err.keyValue)[0]];
  return new AppError(
    `Duplicate value "${duplicateValue}". Please use another one !`,
    400,
  );
};

const handleValidationError = err => new AppError(err.message, 400);

const handleJwtError = () => new AppError('Invalid token !', 401);

module.exports = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  res.status(err.statusCode || 500);
  let error = { ...err, message: err.message };
  if (isDev) return sendDevelopmentError(err, res, req);
  if (error.kind === 'ObjectId') error = handleCastError(error);
  else if (error.code === 11000) error = handleDuplicateKeyError(error);
  else if (err instanceof ValidationError) error = handleValidationError(err);
  else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    error = handleJwtError();
  }
  sendProductionError(error, req, res);
};
