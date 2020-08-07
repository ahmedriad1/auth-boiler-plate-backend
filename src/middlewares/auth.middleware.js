const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../errors/AppError');
const UserModel = require('../models/user.model');

module.exports = async (req, res, next) => {
  try {
    let token;

    // check for token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.toLowerCase().startsWith('bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next(new AppError('Not authenticated !', 401));

    // verify jwt token, and get decoded data
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded._id).select('-__v');

    // user is not found
    if (!user) {
      return next(
        new AppError('The user belonging to this token no longer exisit !', 401),
      );
    }

    // user has changes his password after this token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new AppError('User changed the password, please login again !', 401));
    }

    // bind user to request and move on
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};
