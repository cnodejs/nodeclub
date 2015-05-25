var mongoose = require('mongoose');
var colors   = require('colors');
var logger   = require('../common/logger');

mongoose.set('debug', function (coll, method, query, doc) {
  logger.debug("MONGO".magenta, coll + '.' + method.blue, JSON.stringify(query));
});
