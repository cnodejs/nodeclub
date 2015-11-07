var qn    = require('./store_qn');
var local = require('./store_local');

module.exports = qn || local;
