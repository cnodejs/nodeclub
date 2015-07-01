var mongoose = require('mongoose');
var logger   = require('../common/logger');

var traceMQuery = function (method, info, query) {
  return function (err, result, millis) {
    var infos = [];
    infos.push(query._collection.collection.name + "." + method.blue);
    infos.push(JSON.stringify(info));
    infos.push((millis + 'ms').green);

    // var duration = (new Date()) - t;
    logger.debug("MONGO".magenta, infos.join(' '));
  };
};

mongoose.Mongoose.prototype.mquery.setGlobalTraceFunction(traceMQuery);
