const successResp = (res, data = {}, message = 'API response successful', code = 200) => {
  return res.status(code).json({
    status: 'success',
    code,
    message,
    count: Array.isArray(data) ? data.length : undefined,
    data
  });
};

module.exports = { successResp };
