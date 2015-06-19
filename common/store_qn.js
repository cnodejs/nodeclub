var qn     = require('qn');
var config = require('../config');

//7牛 client
var qnClient = null;
if (config.qn_access && config.qn_access.secretKey !== 'your secret key') {
  qnClient = qn.create(config.qn_access);
}

module.exports = qnClient;
