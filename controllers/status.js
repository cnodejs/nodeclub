// 用于網絡監控
exports.status = function (req, res, next) {
  res.json({status: 'success', now: new Date()});
};
