const asyncWrapper = require('express-async-wrapper');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const AppError = require('../../utils/AppError');

const JWT_SECRET_KEY = config.get('JWT_SECRET_KEY');

const routeGuard = asyncWrapper(async (req, res, next) => {
  try {
    const token = req.headers['api-key'];

    if (!token) throw new AppError(401, 'Missing authorization token');
    const isJwt = validator.isJWT(token);
    if (!isJwt) throw new AppError(401, 'Invalid auth token');

    const jwtVerified = jwt.verify(token, JWT_SECRET_KEY);

    // later implement user account blocked feature
    // if (user.isActive !== 'A') throw new ASRSError(401, 'Account blocked temporarily');

    // Write Route level access to different Roles

    req.userId = jwtVerified.userId;
    req.userName = jwtVerified.name;
    req.userRole = jwtVerified.role;
    next();
  } catch (err) {
    if (['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(err.name)) {
      throw new AppError(401, 'Authentication token is Invalid or Expired, please login again');
    }
    throw err;
  }
});

module.exports = routeGuard;
