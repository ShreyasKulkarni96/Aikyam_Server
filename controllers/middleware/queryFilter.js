const asyncWrapper = require('express-async-wrapper');
const AppError = require('../../utils/AppError');

const paginationFilter = asyncWrapper(async (req, res, next) => {
  // Parse Limit and skip
  let limit = req.query.limit || 10;
  let offset = req.query.skip || 0;
  if (isNaN(limit) || limit < 0) throw new AppError(400, 'limit should be a +ve number only');
  if (isNaN(offset) || offset < 0) throw new AppError(400, 'skip should be a +ve number only');
  req.query.limit = parseInt(limit);

  // select attributes
  const fields = req.query.fields ? req.query.fields.split(',').map(el => el.trim()) : undefined;
  req.query.offset = parseInt(offset);
  req.query.fields = fields;

  next();
});

module.exports = { paginationFilter };
