var redis  = require('./redis');
var _      = require('lodash');
var logger = require("./logger");

var get = function (key, callback) {
  var t = new Date();
  redis.get(key, function (err, data) {
    if (err) {
      return callback(err);
    }
    if (!data) {
      return callback();
    }
    data = JSON.parse(data);
    logger.info("Cache", "get", key);
    callback(null, data);
  });
};

exports.get = get;

// time 参数可选，秒为单位
var set = function (key, value, time, callback) {
  if (typeof time === 'function') {
    callback = time;
    time = null;
  }
  callback = callback || _.noop;
  value = JSON.stringify(value);
  logger.info("Cache", "set", key);
  if (!time) {
    redis.set(key, value, callback);
  } else {
    redis.setex(key, time, value, callback);
  }
};

exports.set = set;
