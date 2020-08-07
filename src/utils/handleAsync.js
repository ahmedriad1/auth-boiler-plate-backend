module.exports = callback => async (req, res, next) => {
  try {
    await callback(req, res, next);
  } catch (err) {
    next(err);
  }
};
