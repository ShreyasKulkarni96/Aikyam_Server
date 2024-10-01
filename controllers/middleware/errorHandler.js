const expressErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;

  // 400 - 500 statusCode don't log otherWise log, implement later
  if ([200, 500].includes(statusCode)) {
    console.log(err);
    // later implement file based logging
  }
  res.status(statusCode === 200 ? 500 : statusCode);
  res.json({
    status: err.status || 'error',
    statusCode: statusCode === 200 ? 500 : statusCode,
    message: err.message || 'Something went wrong',
    stack: process.env.NODE_ENV === 'production' || (statusCode >= 400 && statusCode < 500) ? null : err.stack
  });
};

module.exports = { expressErrorHandler };
