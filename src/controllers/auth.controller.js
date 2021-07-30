const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const UserModel = require('../models/user.model');
const AppError = require('../errors/AppError');
const handleAsync = require('../utils/handleAsync');

// reusable function to send a jwt token
// eslint-disable-next-line object-curly-newline
const sendToken = ({
  res,
  user,
  statusCode = 200,
  message = null,
  withRefreshToken = true,
}) => {
  const token = user.signToken();
  if (user.password) user.password = undefined;
  const data = { token, user };
  if (message) data.message = message;
  if (withRefreshToken) data.refreshToken = user.signRefreshToken();
  return res.status(statusCode).json(data);
};

exports.register = handleAsync(async (req, res, next) => {
  // eslint-disable-next-line object-curly-newline
  const { name, email, password, confirm_password } = req.body;
  const user = await UserModel.create({
    name,
    email,
    password,
    confirm_password,
  });
  sendToken({ res, user, statusCode: 201 });
});

exports.login = handleAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password !', 400));
  }
  const user = await UserModel.findOne({ email }).select('+password');
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Invalid email or password !', 401));
  }
  sendToken({ req, res, user });
});

exports.me = (req, res, next) => {
  res.status(200).json({
    user: req.user,
  });
};

exports.update = handleAsync(async (req, res, next) => {
  const { name, email } = req.body;
  const data = {};
  if (name) data.name = name;
  if (email) data.email = email;
  const user = await UserModel.findByIdAndUpdate(req.user._id, data, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ user });
});

exports.updatePassword = handleAsync(async (req, res, next) => {
  const user = await UserModel.findById(req.user._id).select('+password');
  const { current_password, password, confirm_password } = req.body;
  if (!(await user.checkPassword(current_password, user.password))) {
    return next(new AppError('Incorrect password !', 401));
  }
  user.password = password;
  user.confirm_password = confirm_password;
  await user.save();
  sendToken({ res, user, message: 'Password updated successfully' });
});

exports.refresh = handleAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return next(new AppError('Please provide a refresh token !', 400));
  }

  // verify jwt token, and get decoded data
  const decoded = await promisify(jwt.verify)(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
  );

  // if token is invalid
  if (!decoded) return next(new AppError('Invalid refresh token !', 400));

  const user = await UserModel.findById(decoded._id);

  if (!user) {
    return next(new AppError('Invalid refresh token !', 400));
  }

  // if user exists create a new access token and no refresh token
  sendToken({
    req,
    res,
    user,
    withRefreshToken: false,
  });
});
