var config = require('../config');
var cache = require('../common/cache');
var moment = require('moment');

var SEPARATOR = '^_^@T_T';

var makePerDayLimiter = function (identityName, identityFn) {
  return function (name, limitCount) {
    return function (req, res, next) {
      var identity = identityFn(req);
      var YYYYMMDD = moment().format('YYYYMMDD');
      var key = YYYYMMDD + SEPARATOR + identityName + SEPARATOR + name + SEPARATOR + identity;

      cache.get(key, function (err, count) {
        if (err) {
          return next(err);
        }
        count = count || 0;
        if (count < limitCount) {
          count += 1;
          cache.set(key, count, 60 * 60 * 24);
          res.set('X-RateLimit-Limit', limitCount);
          res.set('X-RateLimit-Remaining', limitCount - count);
          next();
        } else {
          res.send('ratelimit forbidden. limit is ' + limitCount + ' per day.');
        }
      });
    };
  };
};

exports.peruserperday = makePerDayLimiter('peruserperday', function (req) {
  return (req.user || req.session.user).loginname;
});

exports.peripperday = makePerDayLimiter('peripperday', function (req) {
  return req.ip;
});
