
var mcache = require('memory-cache');

var get = function (key, callback) {
  setImmediate(function () {
    callback(null, mcache.get(key));
  });
};

exports.get = get;

// time 参数可选，毫秒为单位
var set = function (key, value, time, callback) {
  if (typeof time === 'function') {
    callback = time;
    time = null;
  }
  mcache.put(key, value, time);
  setImmediate(function () {
    callback && callback(null);
  });
};

exports.set = set;
