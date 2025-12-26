module.exports = function errorHandler(err, req, res, next) {
  // simple logging; in real apps consider a structured logger
  console.error(err && err.stack ? err.stack : err);
  const status = err && err.status ? err.status : 500;
  const message = err && err.message ? err.message : 'Internal Server Error';
  if (process.env.NODE_ENV === 'production') {
    res.status(status).json({ error: message });
  } else {
    res.status(status).json({ error: message, stack: err && err.stack });
  }
};
