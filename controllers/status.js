/*jslint node: true, regexp: true, nomen: true, indent: 2, vars: true */

'use strict';

// 用于網絡監控
exports.status = function (req, res, next) {
  res.json({status: 'success', now: new Date()});
};
