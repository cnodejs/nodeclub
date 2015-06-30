//clickJacking MiddleWare

module.exports = function (req, res, next) {

  if (req.method != 'GET') {
    return next();
  }

  if (exports.except.test(req.url)) {
    return next();
  }

  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();

}

exports.except = /^\/(public|agent)/;
