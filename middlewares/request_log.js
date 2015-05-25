var logger = require('../common/logger');
var onHeaders = require('on-headers')

module.exports = function(req, res, next) {
  if (/^\/public/.test(req.url)) {
    next();
    return;
  }
  
  var t = new Date();
  logger.log('Started', t.toISOString(), req.method, req.url, req.ip);
  
  next();
  
  onHeaders(res, function onHeaders() {
    var duartion = ((new Date()) - t);
  
    logger.log('Completed', res.statusCode, '(' + duartion + 'ms)\n\n');
  });
}